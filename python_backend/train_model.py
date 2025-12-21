from sklearn.model_selection import GridSearchCV

# ... (Các bước đọc dữ liệu giữ nguyên) ...

# Thay vì khai báo model đơn giản, ta tìm tham số tốt nhất
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10]
}

rf = RandomForestClassifier(random_state=42)

# Máy sẽ chạy thử tất cả các trường hợp để tìm ra cái xịn nhất
print("Đang tìm tham số tối ưu (Grid Search)...")
grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=5, n_jobs=-1, verbose=2)
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Tham số tốt nhất: {grid_search.best_params_}")

# Đánh giá model xịn nhất
accuracy = best_model.score(X_test, y_test)
print(f"Độ chính xác sau khi tối ưu: {accuracy * 100:.2f}%")

# Lưu model xịn nhất
joblib.dump(best_model, 'heart_model.pkl')