import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Load your dataset
data = pd.read_csv("data.csv")  # Replace with your actual file
print(data)


# Convert 'study_hour' to minutes from midnight
def time_to_minutes(time_str):
    t = datetime.strptime(time_str.strip(), "%I:%M:%S %p")
    print(time_str, t.hour * 60 + t.minute)
    return t.hour * 60 + t.minute


data["study_hour_mins"] = data["study_hour"].apply(time_to_minutes)

# Scatter plot
plt.figure(figsize=(10, 6))
sns.scatterplot(x="study_hour_mins", y="study_minutes", data=data)
plt.title("Study Minutes vs Study Time of Day")
plt.xlabel("Study Start Time (Minutes from Midnight)")
plt.ylabel("Study Minutes")
plt.grid(True)
plt.show()
