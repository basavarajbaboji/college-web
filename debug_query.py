import sqlite3

def test_query():
    conn = sqlite3.connect('college.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    category_order = """
        CASE category
            WHEN 'GM' THEN 1
            WHEN 'SC' THEN 2
            WHEN 'ST' THEN 3
            WHEN 'Cat-1' THEN 4
            WHEN '2A' THEN 5
            WHEN '2B' THEN 6
            WHEN '3A' THEN 7
            WHEN '3B' THEN 8
            ELSE 9
        END
    """
    
    try:
        query = f"SELECT * FROM applications ORDER BY {category_order} ASC, sslc_percentage DESC"
        print(f"Executing: {query}")
        cursor.execute(query)
        rows = cursor.fetchall()
        print(f"Rows found: {len(rows)}")
        for row in rows:
            print(f"{row['candidate_name']} - {row['category']} - {row['sslc_percentage']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_query()
