import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import plotly.graph_objects as go


def model_graphs():
    # --- Load data ---
    cam_df = pd.read_csv("cam-records.csv")
    cam_mini_df = pd.read_csv("cam-records-mini.csv")
    survey_df = pd.read_csv("survey.csv")

    # --- Record counts ---
    cam_df_records = len(cam_df)
    cam_mini_df_records = len(cam_mini_df)
    survey_df_records = len(survey_df)

    total_records = cam_df_records + survey_df_records
    total_records_mini = cam_mini_df_records + survey_df_records

    # --- Feature setup ---
    X_cam = cam_df[["start-time", "laptop", "ipad", "mouse", "bag"]]
    y_cam = cam_df["duration"]
    X_cam_mini = cam_mini_df[["start-time", "laptop", "ipad", "mouse", "bag"]]
    y_cam_mini = cam_mini_df["duration"]

    # --- Train/Test Split ---
    X_train_cam, X_test_cam, y_train_cam, y_test_cam = train_test_split(
        X_cam, y_cam, test_size=0.3, random_state=42
    )
    X_train_cam_mini, X_test_cam_mini, y_train_cam_mini, y_test_cam_mini = (
        train_test_split(X_cam_mini, y_cam_mini, test_size=0.3, random_state=42)
    )

    # --- Train Survey Model ---
    linreg = LinearRegression()
    linreg.fit(survey_df[["start-time"]], survey_df["duration"])
    survey_preds = linreg.predict(X_test_cam[["start-time"]])
    survey_preds_mini = linreg.predict(X_test_cam_mini[["start-time"]])

    # --- Model 1: Random Forest ---
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train_cam, y_train_cam)
    rf_preds = rf.predict(X_test_cam)
    hybrid_rf_preds = (cam_df_records / total_records) * rf_preds + (
        survey_df_records / total_records
    ) * survey_preds

    rf_mini = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_mini.fit(X_train_cam_mini, y_train_cam_mini)
    rf_preds_mini = rf_mini.predict(X_test_cam_mini)
    hybrid_rf_preds_mini = (
        cam_mini_df_records / total_records_mini
    ) * rf_preds_mini + (survey_df_records / total_records_mini) * survey_preds_mini

    mse_rf = mean_squared_error(y_test_cam, hybrid_rf_preds)
    r2_rf = r2_score(y_test_cam, hybrid_rf_preds)
    mse_rf_mini = mean_squared_error(y_test_cam_mini, hybrid_rf_preds_mini)
    r2_rf_mini = r2_score(y_test_cam_mini, hybrid_rf_preds_mini)

    # --- Model 2: KNN ---
    knn = KNeighborsRegressor(n_neighbors=10)
    knn.fit(X_train_cam, y_train_cam)
    knn_preds = knn.predict(X_test_cam)
    hybrid_knn_preds = (cam_df_records / total_records) * knn_preds + (
        survey_df_records / total_records
    ) * survey_preds

    knn_mini = KNeighborsRegressor(n_neighbors=10)
    knn_mini.fit(X_train_cam_mini, y_train_cam_mini)
    knn_preds_mini = knn_mini.predict(X_test_cam_mini)
    hybrid_knn_preds_mini = (
        cam_mini_df_records / total_records_mini
    ) * knn_preds_mini + (survey_df_records / total_records_mini) * survey_preds_mini

    mse_knn = mean_squared_error(y_test_cam, hybrid_knn_preds)
    r2_knn = r2_score(y_test_cam, hybrid_knn_preds)
    mse_knn_mini = mean_squared_error(y_test_cam_mini, hybrid_knn_preds_mini)
    r2_knn_mini = r2_score(y_test_cam_mini, hybrid_knn_preds_mini)

    # --- Combined Results Printout ---
    print(f"Random Forest MSE: {mse_rf:.2f}, R²: {r2_rf:.2f}")
    print(f"KNN MSE: {mse_knn:.2f}, R²: {r2_knn:.2f}")
    print(f"Random Forest MINI MSE: {mse_rf_mini:.2f}, R²: {r2_rf_mini:.2f}")
    print(f"KNN MINI MSE: {mse_knn_mini:.2f}, R²: {r2_knn_mini:.2f}")

    # --- MSE Comparison Chart ---
    fig_mse_comparison = go.Figure()
    fig_mse_comparison.add_trace(
        go.Bar(
            x=["Random Forest", "KNN"],
            y=[mse_rf, mse_knn],
            name="Full",
            marker_color=["green", "blue"],
        )
    )
    fig_mse_comparison.add_trace(
        go.Bar(
            x=["Random Forest", "KNN"],
            y=[mse_rf_mini, mse_knn_mini],
            name="Mini",
            marker_color=["lightgreen", "lightblue"],
        )
    )
    fig_mse_comparison.update_layout(
        title="MSE Comparison: Random Forest vs KNN",
        yaxis_title="Mean Squared Error",
        barmode="group",
    )
    fig_mse_comparison.show()

    # --- R² Score Comparison Chart ---
    fig_r2_comparison = go.Figure()
    fig_r2_comparison.add_trace(
        go.Bar(
            x=["Random Forest", "KNN"],
            y=[r2_rf, r2_knn],
            name="Full",
            marker_color=["darkgreen", "darkblue"],
        )
    )
    fig_r2_comparison.add_trace(
        go.Bar(
            x=["Random Forest", "KNN"],
            y=[r2_rf_mini, r2_knn_mini],
            name="Mini",
            marker_color=["lightgreen", "lightblue"],
        )
    )
    fig_r2_comparison.update_layout(
        title="Accuracy (R²) Comparison: Random Forest vs KNN",
        yaxis_title="R² Score",
        barmode="group",
    )
    fig_r2_comparison.show()

    # --- Optional: Plot one model's predictions vs actual ---
    fig = go.Figure()
    fig.add_trace(go.Scatter(y=y_test_cam.values, mode="lines+markers", name="Actual"))
    fig.add_trace(
        go.Scatter(y=hybrid_rf_preds, mode="lines+markers", name="RF Predicted")
    )
    fig.add_trace(
        go.Scatter(y=hybrid_knn_preds, mode="lines+markers", name="KNN Predicted")
    )
    fig.update_layout(
        title="Actual vs Predicted Durations (Hybrid Models)",
        xaxis_title="Sample Index",
        yaxis_title="Duration (minutes)",
    )
    fig.show()


model_graphs()
