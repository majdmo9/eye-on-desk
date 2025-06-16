import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from obj_types.predictions import RowToPredict
import plotly.graph_objects as go


def predict_use_time(new_data: RowToPredict) -> float:
    df = pd.read_csv("cam-records.csv")
    survey_df = pd.read_csv("survey.csv")

    survey_X = survey_df[["start-time"]]
    survey_y = survey_df["duration"]

    cam_df_records = len(df)
    survey_df_records = len(survey_df)
    total_records = cam_df_records + survey_df_records

    X = df[["start-time", "laptop", "ipad", "mouse", "bag"]]
    y = df["duration"]

    # Split data
    X_train, _, y_train, _ = train_test_split(X, y, random_state=42)

    # Create and train KNN model
    knn = KNeighborsRegressor(n_neighbors=5)
    knn.fit(X_train, y_train)
    linreg = LinearRegression().fit(survey_X, survey_y)

    data_to_predict = [
        [
            new_data["start_time"],
            new_data["laptop"],
            new_data["ipad"],
            new_data["mouse"],
            new_data["bag"],
        ]
    ]

    predicted_duration = knn.predict(data_to_predict)[0]  # Convert to float
    survey_predicted_duration = linreg.predict([[data_to_predict[0][0] - 8]])[0]

    hybrid_preds = (cam_df_records / total_records) * predicted_duration + (
        survey_df_records / total_records
    ) * survey_predicted_duration

    return float(hybrid_preds)


def model_graphs():
    cam_df = pd.read_csv("cam-records.csv")
    cam_mini_df = pd.read_csv("cam-records-mini.csv")
    survey_df = pd.read_csv("survey.csv")

    cam_df_records = len(cam_df)
    cam_mini_df_records = len(cam_mini_df)
    survey_df_records = len(survey_df)

    total_records = cam_df_records + survey_df_records
    total_records_mini = cam_mini_df_records + survey_df_records

    X_cam = cam_df[["start-time", "laptop", "ipad", "mouse", "bag"]]
    y_cam = cam_df["duration"]
    X_cam_mini = cam_mini_df[["start-time", "laptop", "ipad", "mouse", "bag"]]
    y_cam_mini = cam_mini_df["duration"]

    X_train_cam, X_test_cam, y_train_cam, y_test_cam = train_test_split(
        X_cam, y_cam, test_size=0.3, random_state=42
    )
    X_train_cam_mini, X_test_cam_mini, y_train_cam_mini, y_test_cam_mini = (
        train_test_split(X_cam_mini, y_cam_mini, test_size=0.3, random_state=42)
    )

    # Train Random Forest model on cam-records
    knn = KNeighborsRegressor(n_neighbors=10)
    knn.fit(X_train_cam, y_train_cam)
    knn_preds = knn.predict(X_test_cam)

    knn_mini = KNeighborsRegressor(n_neighbors=10)
    knn_mini.fit(X_train_cam_mini, y_train_cam_mini)
    knn_preds_mini = knn_mini.predict(X_test_cam_mini)

    # --- Prepare survey model ---
    survey_X = survey_df[["start-time"]]
    survey_y = survey_df["duration"]
    linreg = LinearRegression()
    linreg.fit(survey_X, survey_y)

    # Predict survey-based durations using start-times from cam test set
    X_test_survey = X_test_cam[["start-time"]]
    X_test_survey_mini = X_test_cam_mini[["start-time"]]

    survey_preds = linreg.predict(X_test_survey)
    survey_preds_mini = linreg.predict(X_test_survey_mini)

    print(f"len survey preds: {len(survey_preds)}")
    print(f"len survey preds mini: {len(survey_preds_mini)}")

    # --- Hybrid prediction (weighted average) ---
    hybrid_preds = (cam_df_records / total_records) * knn_preds + (
        survey_df_records / total_records
    ) * survey_preds
    hybrid_preds_mini = (cam_mini_df_records / total_records_mini) * knn_preds_mini + (
        survey_df_records / total_records_mini
    ) * survey_preds_mini

    # --- Evaluation ---
    mse = mean_squared_error(y_test_cam, hybrid_preds)
    mse_mini = mean_squared_error(y_test_cam_mini, hybrid_preds_mini)
    r2 = r2_score(y_test_cam, hybrid_preds)
    r2_mini = r2_score(y_test_cam_mini, hybrid_preds_mini)
    print(f"Hybrid Model MSE: {mse:.2f}")
    print(f"Hybrid Model R² Score: {r2:.2f}")

    # --- Visualization ---
    fig = go.Figure()
    fig.add_trace(go.Scatter(y=y_test_cam.values, mode="lines+markers", name="Actual"))
    fig.add_trace(go.Scatter(y=hybrid_preds, mode="lines+markers", name="Predicted"))
    fig.update_layout(
        title="Actual vs Predicted Durations (Weighted Hybrid Model)",
        xaxis_title="Sample Index",
        yaxis_title="Duration (minutes)",
    )
    fig.show()

    fig_mse = go.Figure()
    fig_mse.add_trace(
        go.Bar(x=["Hybrid Model"], y=[mse], name="MSE", marker_color="limegreen")
    )
    fig_mse.add_trace(
        go.Bar(x=["Hybrid Model"], y=[mse_mini], name="MSE_MINI", marker_color="red")
    )
    fig_mse.update_layout(
        title="Mean Squared Error (MSE)",
        yaxis_title="MSE (squared minutes)",
        xaxis_title="Model",
    )
    fig_mse.show()

    # Accuracy Graph (R² Score)
    fig_r2 = go.Figure()
    fig_r2.add_trace(
        go.Bar(x=["Hybrid Model"], y=[r2], name="R² Score", marker_color="royalblue")
    )
    fig_r2.add_trace(
        go.Bar(
            x=["Hybrid Model"],
            y=[r2_mini],
            name="R² Score Mini",
            marker_color="orangered",
        )
    )
    min_r2 = min(r2, r2_mini)
    fig_r2.update_layout(
        title="Model Accuracy (R² Score)",
        yaxis=dict(range=[min(-0.5, min_r2 - 0.1), 1], title="R² Score"),
        xaxis_title="Model",
    )
    print(f"r2 mini: {r2_mini}")
    print(f"mse mini: {mse_mini}")
    fig_r2.show()
