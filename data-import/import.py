import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
import glob

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def insert_data(file):
    print(f"\n📖 Processing: {file}")
    df = pd.read_excel(file)
    df.columns = df.columns.str.strip().str.lower()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    for index, row in df.iterrows():
        try:
            state_code = str(row['mdds stc']).strip()
            state_name = str(row['state name']).strip()
            district_code = str(row['mdds dtc']).strip()
            district_name = str(row['district name']).strip()
            subdistrict_code = str(row['mdds sub_dt']).strip()
            subdistrict_name = str(row['sub-district name']).strip()
            village_code = str(row['mdds plcn']).strip()
            village_name = str(row['area name']).strip()

            # Insert State
            cursor.execute("""
                INSERT INTO "State" (name, code, "countryId", "createdAt", "updatedAt")
                VALUES (%s, %s, 1, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
            """, (state_name, state_code))

            # Get State ID
            cursor.execute('SELECT id FROM "State" WHERE code = %s', (state_code,))
            state_id = cursor.fetchone()[0]

            # Insert District
            cursor.execute("""
                INSERT INTO "District" (name, code, "stateId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
            """, (district_name, district_code, state_id))

            # Get District ID
            cursor.execute('SELECT id FROM "District" WHERE code = %s', (district_code,))
            district_id = cursor.fetchone()[0]

            # Insert SubDistrict
            cursor.execute("""
                INSERT INTO "SubDistrict" (name, code, "districtId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
            """, (subdistrict_name, subdistrict_code, district_id))

            # Get SubDistrict ID
            cursor.execute('SELECT id FROM "SubDistrict" WHERE code = %s', (subdistrict_code,))
            subdistrict_id = cursor.fetchone()[0]

            # Insert Village
            cursor.execute("""
                INSERT INTO "Village" (name, code, "subDistrictId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
            """, (village_name, village_code, subdistrict_id))

            if index % 500 == 0:
                conn.commit()
                print(f"✅ Processed {index} rows...")

        except Exception as e:
            print(f"❌ Error at row {index}: {e}")
            try:
                conn.rollback()
            except:
                conn = get_connection()
                cursor = conn.cursor()
            continue

    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ Done: {file}")

# Connect and create country
conn = get_connection()
cursor = conn.cursor()
print("✅ Connected to NeonDB!")

excel_files = glob.glob("*.xls") + glob.glob("*.xlsx") + glob.glob("*.ods")
print(f"📁 Found {len(excel_files)} Excel files!")

cursor.execute("""
    INSERT INTO "Country" (name, code, "createdAt", "updatedAt")
    VALUES ('India', 'IN', NOW(), NOW())
    ON CONFLICT (code) DO NOTHING
""")
conn.commit()
cursor.close()
conn.close()
print("✅ Country India created!")

for file in excel_files:
    insert_data(file)

print("\n🎉 All data imported successfully!")