import asyncio
import sqlite3
from collections import defaultdict, deque
from datetime import datetime, date, time, timezone

import asyncpg


# ============================================================
# CONFIGURATION
# ============================================================

SQLITE_DB = "icap.db"

PG_HOST = "postgres"
PG_PORT = 5432
PG_USER = "postgres"
PG_PASSWORD = "icappostgres"
PG_DATABASE = "icap"


# ============================================================
# POSTGRESQL CONNECTION
# ============================================================

async def get_postgres_connection():
    return await asyncpg.connect(
        host=PG_HOST,
        port=PG_PORT,
        user=PG_USER,
        password=PG_PASSWORD,
        database=PG_DATABASE,
    )


# ============================================================
# SQLITE HELPERS
# ============================================================

def get_sqlite_tables(conn):
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        """
    ).fetchall()

    return [row[0] for row in rows]


def get_sqlite_columns(conn, table):
    rows = conn.execute(
        f'PRAGMA table_info("{table}")'
    ).fetchall()

    return [row[1] for row in rows]


def get_sqlite_rows(conn, table, columns):
    column_list = ", ".join(
        f'"{column}"'
        for column in columns
    )

    query = f'''
        SELECT {column_list}
        FROM "{table}"
    '''

    return conn.execute(query).fetchall()


# ============================================================
# POSTGRESQL COLUMN TYPES
# ============================================================

async def get_postgres_column_types(pg, table):
    rows = await pg.fetch(
        """
        SELECT
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
        """,
        table,
    )

    return {
        row["column_name"]: row["data_type"]
        for row in rows
    }


# ============================================================
# VALUE CONVERSION
# ============================================================

def convert_value_for_postgres(value, postgres_type):
    """
    Convert SQLite values into PostgreSQL-compatible Python values.
    """

    if value is None:
        return None

    # --------------------------------------------------------
    # BOOLEAN
    # --------------------------------------------------------

    if postgres_type == "boolean":

        if isinstance(value, bool):
            return value

        if isinstance(value, int):
            return value != 0

        if isinstance(value, str):

            value_lower = value.strip().lower()

            if value_lower in (
                "1",
                "true",
                "t",
                "yes",
                "y",
            ):
                return True

            if value_lower in (
                "0",
                "false",
                "f",
                "no",
                "n",
            ):
                return False

    # --------------------------------------------------------
    # TIMESTAMP
    # --------------------------------------------------------

    if postgres_type in (
        "timestamp without time zone",
        "timestamp with time zone",
    ):

        if isinstance(value, datetime):
            return value

        if isinstance(value, str):

            value_string = value.strip()

            try:

                converted = datetime.fromisoformat(
                    value_string.replace("Z", "+00:00")
                )

                # PostgreSQL TIMESTAMP WITHOUT TIME ZONE
                # expects a naive datetime.
                if postgres_type == "timestamp without time zone":

                    if converted.tzinfo is not None:
                        converted = converted.astimezone(
                            timezone.utc
                        ).replace(tzinfo=None)

                    return converted

                # PostgreSQL TIMESTAMP WITH TIME ZONE
                if postgres_type == "timestamp with time zone":

                    if converted.tzinfo is None:
                        converted = converted.replace(
                            tzinfo=timezone.utc
                        )

                    return converted

            except (ValueError, TypeError):
                print(
                    f"WARNING: Could not convert timestamp value "
                    f"{value!r}"
                )

    # --------------------------------------------------------
    # DATE
    # --------------------------------------------------------

    if postgres_type == "date":

        if isinstance(value, datetime):
            return value.date()

        if isinstance(value, date):
            return value

        if isinstance(value, str):

            try:
                return date.fromisoformat(
                    value.strip()
                )

            except ValueError:
                print(
                    f"WARNING: Could not convert date value "
                    f"{value!r}"
                )

    # --------------------------------------------------------
    # TIME
    # --------------------------------------------------------

    if postgres_type.startswith("time"):

        if isinstance(value, time):
            return value

        if isinstance(value, str):

            try:
                return time.fromisoformat(
                    value.strip()
                )

            except ValueError:
                print(
                    f"WARNING: Could not convert time value "
                    f"{value!r}"
                )

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return value


# ============================================================
# FOREIGN KEY DEPENDENCIES
# ============================================================

async def get_foreign_keys(pg, tables):

    rows = await pg.fetch(
        """
        SELECT
            tc.table_name AS child_table,
            ccu.table_name AS parent_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        """
    )

    dependencies = defaultdict(set)

    for row in rows:

        child = row["child_table"]
        parent = row["parent_table"]

        if (
            child in tables
            and parent in tables
            and child != parent
        ):
            dependencies[child].add(parent)

    return dependencies


# ============================================================
# TOPOLOGICAL SORT
# ============================================================

def topological_sort(tables, dependencies):

    graph = defaultdict(list)

    indegree = {
        table: 0
        for table in tables
    }

    for child, parents in dependencies.items():

        for parent in parents:

            graph[parent].append(child)

            indegree[child] += 1

    queue = deque(
        table
        for table in tables
        if indegree[table] == 0
    )

    ordered = []

    while queue:

        table = queue.popleft()

        ordered.append(table)

        for child in graph[table]:

            indegree[child] -= 1

            if indegree[child] == 0:
                queue.append(child)

    # Handle circular dependencies
    if len(ordered) != len(tables):

        for table in tables:

            if table not in ordered:
                ordered.append(table)

    return ordered


# ============================================================
# RESET POSTGRESQL SEQUENCES
# ============================================================

async def reset_sequences(pg, tables):

    print("\nResetting PostgreSQL sequences...")

    for table in tables:

        try:

            sequences = await pg.fetch(
                """
                SELECT
                    column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = $1
                  AND column_default LIKE 'nextval(%'
                """,
                table,
            )

            for row in sequences:

                column = row["column_name"]

                await pg.execute(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence(
                            '"{table}"',
                            '{column}'
                        ),
                        COALESCE(
                            (
                                SELECT MAX("{column}")
                                FROM "{table}"
                            ),
                            1
                        ),
                        true
                    )
                    """
                )

                print(
                    f"  Sequence reset: "
                    f"{table}.{column}"
                )

        except Exception as exc:

            print(
                f"  Sequence reset skipped "
                f"for {table}: {exc}"
            )


# ============================================================
# MAIN MIGRATION
# ============================================================

async def main():

    print("=" * 60)
    print("ICAP SQLite → PostgreSQL Migration")
    print("=" * 60)

    sqlite_conn = None
    pg = None

    try:

        # ----------------------------------------------------
        # CONNECT TO SQLITE
        # ----------------------------------------------------

        sqlite_conn = sqlite3.connect(
            SQLITE_DB
        )

        print("\nReading SQLite database...")

        tables = get_sqlite_tables(
            sqlite_conn
        )

        print(
            f"Found {len(tables)} tables:"
        )

        for table in tables:

            print(
                f"  - {table}"
            )

        # ----------------------------------------------------
        # CONNECT TO POSTGRESQL
        # ----------------------------------------------------

        pg = await get_postgres_connection()

        print(
            "\nConnected to PostgreSQL."
        )

        # ----------------------------------------------------
        # VERIFY POSTGRESQL TABLES
        # ----------------------------------------------------

        pg_tables = await pg.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            """
        )

        pg_table_names = {
            row["table_name"]
            for row in pg_tables
        }

        missing = [
            table
            for table in tables
            if table not in pg_table_names
        ]

        if missing:

            raise RuntimeError(
                "These SQLite tables are missing "
                f"in PostgreSQL: {missing}"
            )

        # ----------------------------------------------------
        # FOREIGN KEY ORDER
        # ----------------------------------------------------

        dependencies = await get_foreign_keys(
            pg,
            tables
        )

        ordered_tables = topological_sort(
            tables,
            dependencies
        )

        print("\nMigration order:")

        for table in ordered_tables:

            print(
                f"  → {table}"
            )

        migrated_counts = {}

        # ----------------------------------------------------
        # BEGIN TRANSACTION
        # ----------------------------------------------------

        await pg.execute(
            "BEGIN"
        )

        # ----------------------------------------------------
        # MIGRATE EACH TABLE
        # ----------------------------------------------------

        for table in ordered_tables:

            print(
                "\n----------------------------------------"
            )

            print(
                f"Migrating table: {table}"
            )

            print(
                "----------------------------------------"
            )

            # Get SQLite columns
            sqlite_columns = get_sqlite_columns(
                sqlite_conn,
                table
            )

            # Get PostgreSQL column types
            pg_column_types = (
                await get_postgres_column_types(
                    pg,
                    table
                )
            )

            pg_columns = list(
                pg_column_types.keys()
            )

            # ------------------------------------------------
            # MATCH COLUMNS
            # ------------------------------------------------

            columns = [
                column
                for column in sqlite_columns
                if column in pg_columns
            ]

            if not columns:

                print(
                    f"Skipping {table}: "
                    "no matching columns."
                )

                migrated_counts[table] = 0

                continue

            # ------------------------------------------------
            # READ SQLITE DATA
            # ------------------------------------------------

            rows = get_sqlite_rows(
                sqlite_conn,
                table,
                columns
            )

            print(
                f"SQLite rows found: {len(rows)}"
            )

            if not rows:

                print(
                    f"{table}: 0 rows"
                )

                migrated_counts[table] = 0

                continue

            # ------------------------------------------------
            # CONVERT VALUES
            # ------------------------------------------------

            converted_rows = []

            for row_index, row in enumerate(rows):

                converted_row = []

                for value, column in zip(
                    row,
                    columns
                ):

                    postgres_type = (
                        pg_column_types[column]
                    )

                    converted_value = (
                        convert_value_for_postgres(
                            value,
                            postgres_type
                        )
                    )

                    # ----------------------------------------
                    # SAFETY CHECK FOR TIMESTAMP
                    # ----------------------------------------

                    if postgres_type in (
                        "timestamp without time zone",
                        "timestamp with time zone",
                    ):

                        if isinstance(
                            converted_value,
                            str
                        ):

                            print(
                                "\nWARNING:"
                            )

                            print(
                                f"Could not convert "
                                f"{table}.{column}"
                            )

                            print(
                                f"Value: "
                                f"{converted_value!r}"
                            )

                            raise ValueError(
                                f"Timestamp conversion failed "
                                f"for {table}.{column}: "
                                f"{converted_value!r}"
                            )

                    converted_row.append(
                        converted_value
                    )

                converted_rows.append(
                    tuple(converted_row)
                )

            rows = converted_rows

            # ------------------------------------------------
            # CREATE INSERT QUERY
            # ------------------------------------------------

            column_list = ", ".join(
                f'"{column}"'
                for column in columns
            )

            placeholders = ", ".join(
                f"${index + 1}"
                for index in range(
                    len(columns)
                )
            )

            query = f"""
                INSERT INTO "{table}"
                ({column_list})
                VALUES ({placeholders})
            """

            # ------------------------------------------------
            # INSERT DATA
            # ------------------------------------------------

            try:

                await pg.executemany(
                    query,
                    rows
                )

            except Exception as exc:

                print(
                    "\nERROR while inserting "
                    f"table: {table}"
                )

                print(
                    f"Columns: {columns}"
                )

                print(
                    f"Number of rows: "
                    f"{len(rows)}"
                )

                print(
                    f"PostgreSQL column types: "
                    f"{pg_column_types}"
                )

                # Print first problematic row
                if rows:

                    print(
                        "\nFirst converted row:"
                    )

                    print(
                        rows[0]
                    )

                    print(
                        "\nFirst row Python types:"
                    )

                    print(
                        [
                            (
                                column,
                                type(value).__name__
                            )
                            for column, value
                            in zip(
                                columns,
                                rows[0]
                            )
                        ]
                    )

                raise exc

            migrated_counts[table] = len(
                rows
            )

            print(
                f"SUCCESS: {table} → "
                f"{len(rows)} rows migrated"
            )

        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        await pg.execute(
            "COMMIT"
        )

        # ----------------------------------------------------
        # RESET SEQUENCES
        # ----------------------------------------------------

        await reset_sequences(
            pg,
            ordered_tables
        )

        # ----------------------------------------------------
        # FINAL RESULT
        # ----------------------------------------------------

        print(
            "\n" + "=" * 60
        )

        print(
            "Migration completed successfully."
        )

        print(
            "=" * 60
        )

        total = sum(
            migrated_counts.values()
        )

        print(
            f"\nTotal rows migrated: {total}"
        )

        print(
            "\nMigration summary:"
        )

        for table, count in (
            migrated_counts.items()
        ):

            print(
                f"  {table}: {count}"
            )

    except Exception as exc:

        print(
            "\n" + "=" * 60
        )

        print(
            "MIGRATION FAILED"
        )

        print(
            "=" * 60
        )

        print(
            f"\nError: {exc}"
        )

        if pg is not None:

            try:

                await pg.execute(
                    "ROLLBACK"
                )

                print(
                    "\nPostgreSQL transaction "
                    "rolled back."
                )

            except Exception as rollback_error:

                print(
                    "Rollback failed: "
                    f"{rollback_error}"
                )

        raise

    finally:

        if pg is not None:

            await pg.close()

        if sqlite_conn is not None:

            sqlite_conn.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    asyncio.run(
        main()
    )