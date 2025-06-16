import pandas as pd
import numpy as np

# Load your original data
df = pd.read_csv("cam-records.csv")  # Exported from Google Sheets

# Check the structure
print(df.head())

np.random.seed(42)
synthetic_data = df.sample(1000, replace=True).copy()

# Save new dataset
synthetic_data.to_csv("synthetic_data.csv", index=False)
print("✅ 250 synthetic records saved to 'synthetic_data.csv'")
