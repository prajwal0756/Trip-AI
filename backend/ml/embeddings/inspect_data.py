import pandas as pd

# Load the destination CSV
df = pd.read_csv("../data/final_destination.csv")

# Show column names
print("\nColumns:")
print(df.columns.tolist())

# Show first 5 rows
print("\nFirst 5 rows:")
print(df.head())

# Show dataset size
print("\nDataset shape:")
print(df.shape)

# Show missing values
print("\nMissing values:")
print(df.isnull().sum())