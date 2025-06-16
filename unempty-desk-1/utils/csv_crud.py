from obj_types.csv import Row
import os
import pandas as pd


def append_csv_row(filename: str, row: Row):

    row_dict = {
        "start-time": row["start_time"],
        "duration": row["duration"],
        "laptop": row["laptop"],
        "ipad": row["ipad"],
        "mouse": row["mouse"],
        "bag": row["bag"],
    }

    new_row_df = pd.DataFrame([row_dict])

    if os.path.exists(filename):
        new_row_df.to_csv(filename, mode="a", header=False, index=False)
    else:
        new_row_df.to_csv(filename, mode="w", header=True, index=False)

    print(f"✅ Row added to {filename}: {row_dict}")
