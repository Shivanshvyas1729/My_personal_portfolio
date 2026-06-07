const fs = require('fs');
const path = require('path');

const mlModels = [
  {
    id: "logistic_regression",
    title: "Logistic Regression",
    primary_category: "Machine Learning",
    aliases: ["LogReg", "Logit Model"],
    secondary_tags: ["Classification", "Linear Model", "Supervised Learning"],
    definition: "A statistical model that in its basic form uses a logistic function to model a binary dependent variable. It predicts the probability of an instance belonging to a specific class.",
    why_used: "It is extremely fast, highly interpretable, and serves as a fantastic baseline model for classification problems.",
    interview_point: "Even though it has 'regression' in its name, it is a classification algorithm. The output is a probability between 0 and 1, mapped via the Sigmoid function.",
    advantages: ["Highly interpretable coefficients", "Computationally efficient", "Provides well-calibrated probabilities"],
    limitations: ["Assumes linear relationship between independent variables and log-odds", "Struggles with complex, non-linear boundaries", "Vulnerable to multicollinearity"],
    use_cases: ["Spam detection (Spam/Not Spam)", "Customer churn prediction", "Credit scoring (Approve/Reject)"],
    real_world_example: "```python\nfrom sklearn.linear_model import LogisticRegression\n\n# Initialize model with common parameters\nmodel = LogisticRegression(\n    penalty='l2',        # Regularization type ('l1', 'l2', 'elasticnet')\n    C=1.0,               # Inverse of regularization strength (smaller = stronger)\n    solver='lbfgs',      # Algorithm to use for optimization\n    max_iter=100         # Maximum number of iterations taken for the solvers to converge\n)\n\n# Train and predict\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\nprobabilities = model.predict_proba(X_test)[:, 1]\n```",
    difficulty_level: "Beginner",
    term_type: "Algorithm"
  },
  {
    id: "random_forest",
    title: "Random Forest",
    primary_category: "Machine Learning",
    aliases: ["RF", "Random Forests"],
    secondary_tags: ["Ensemble", "Bagging", "Tree-based", "Supervised Learning"],
    definition: "An ensemble learning method that operates by constructing a multitude of decision trees at training time and outputting the class that is the mode of the classes (classification) or mean prediction (regression) of the individual trees.",
    why_used: "Reduces the variance (overfitting) of a single decision tree by averaging multiple trees trained on different parts of the same training set (Bagging) and subsets of features.",
    interview_point: "Random Forest decorrelates trees by selecting a random subset of features at each split, ensuring that a single strong predictor doesn't dominate every tree.",
    advantages: ["Robust to outliers and non-linear data", "Requires very little data preprocessing", "Provides feature importance metrics automatically"],
    limitations: ["Can be slow to score on large datasets", "Acts as a 'black box' making interpretability hard compared to a single tree", "Requires more memory"],
    use_cases: ["Fraud detection", "Predicting patient readmission", "Stock market prediction"],
    real_world_example: "```python\nfrom sklearn.ensemble import RandomForestClassifier\n\n# Initialize model\nrf_model = RandomForestClassifier(\n    n_estimators=100,      # Number of trees in the forest\n    max_depth=10,          # Maximum depth of the tree to prevent overfitting\n    min_samples_split=2,   # Minimum number of samples required to split an internal node\n    max_features='sqrt',   # Number of features to consider when looking for the best split\n    random_state=42        # For reproducibility\n)\n\nrf_model.fit(X_train, y_train)\npreds = rf_model.predict(X_test)\n```",
    difficulty_level: "Beginner",
    term_type: "Algorithm"
  },
  {
    id: "xgboost",
    title: "XGBoost",
    primary_category: "Machine Learning",
    aliases: ["Extreme Gradient Boosting"],
    secondary_tags: ["Ensemble", "Boosting", "Tree-based"],
    definition: "An optimized distributed gradient boosting library designed to be highly efficient, flexible and portable. It implements machine learning algorithms under the Gradient Boosting framework.",
    why_used: "It is widely considered the ultimate algorithmic weapon for structured/tabular data, frequently winning Kaggle competitions.",
    interview_point: "Unlike Random Forest which trains trees in parallel (Bagging), XGBoost trains trees sequentially (Boosting). Each new tree tries to correct the residual errors made by the previous trees.",
    advantages: ["Extremely accurate on tabular data", "Handles missing values internally", "Supports parallel processing during tree building"],
    limitations: ["Prone to overfitting if hyperparameters are not tuned properly", "Harder to tune than Random Forest", "Not ideal for unstructured data (images, text)"],
    use_cases: ["Click-through rate (CTR) prediction", "Dynamic pricing", "Customer lifetime value (CLV) prediction"],
    real_world_example: "```python\nimport xgboost as xgb\n\n# Initialize model\nmodel = xgb.XGBClassifier(\n    n_estimators=200,      # Number of boosting rounds\n    learning_rate=0.05,    # Step size shrinkage (eta)\n    max_depth=6,           # Maximum tree depth\n    subsample=0.8,         # Subsample ratio of the training instances\n    colsample_bytree=0.8,  # Subsample ratio of columns when constructing each tree\n    objective='binary:logistic'\n)\n\nmodel.fit(X_train, y_train)\npreds = model.predict(X_test)\n```",
    difficulty_level: "Intermediate",
    term_type: "Algorithm"
  },
  {
    id: "svm",
    title: "Support Vector Machine",
    primary_category: "Machine Learning",
    aliases: ["SVM", "Support Vector Classifier", "SVC"],
    secondary_tags: ["Supervised Learning", "Classification", "Margin Classifier"],
    definition: "A powerful supervised algorithm that finds the hyperplane that best separates different classes by maximizing the margin between them.",
    why_used: "Highly effective in high-dimensional spaces and when the number of dimensions is greater than the number of samples.",
    interview_point: "The 'Kernel Trick' allows SVMs to solve non-linear problems by mapping inputs into high-dimensional feature spaces without actually computing the coordinates.",
    advantages: ["Effective in high dimensional spaces", "Memory efficient (uses a subset of training points)", "Versatile (different kernel functions can be specified)"],
    limitations: ["Does not scale well to large datasets (O(n^2) or worse)", "Sensitive to noisy data and overlapping classes", "No direct probabilistic interpretation"],
    use_cases: ["Text categorization", "Image classification", "Bioinformatics (Protein classification)"],
    real_world_example: "```python\nfrom sklearn.svm import SVC\n\n# Initialize Support Vector Classifier\nsvm_model = SVC(\n    C=1.0,             # Regularization parameter (higher C = narrower margin, less violations)\n    kernel='rbf',      # Kernel type: 'linear', 'poly', 'rbf', 'sigmoid'\n    gamma='scale',     # Kernel coefficient\n    probability=True   # Enable to use predict_proba() later\n)\n\nsvm_model.fit(X_train, y_train)\npreds = svm_model.predict(X_test)\n```",
    difficulty_level: "Intermediate",
    term_type: "Algorithm"
  }
];

const metrics = [
  {
    id: "accuracy",
    title: "Accuracy",
    primary_category: "Evaluation Metrics",
    aliases: ["Classification Accuracy"],
    secondary_tags: ["Classification", "Basic Metric"],
    definition: "The ratio of correctly predicted observations to the total observations. It is the most intuitive performance measure.",
    why_used: "Provides a quick, overall sense of how often the model is correct when classes are perfectly balanced.",
    interview_point: "Accuracy is highly misleading on imbalanced datasets. For example, if 99% of transactions are legitimate, a model predicting 'legitimate' every time has 99% accuracy but fails to detect any fraud.",
    advantages: ["Easy to explain to non-technical stakeholders", "Calculated easily using a simple formula"],
    limitations: ["Misleading for imbalanced classes", "Does not distinguish between False Positives and False Negatives"],
    formula: "(TP + TN) / (TP + TN + FP + FN)",
    good_value: "Highly domain dependent, usually > 80% on balanced data",
    use_cases: ["Balanced binary classification", "General quick baseline checks"],
    real_world_example: "```python\nfrom sklearn.metrics import accuracy_score\n\n# y_true: Ground truth labels\n# y_pred: Model predictions\nacc = accuracy_score(y_true, y_pred)\nprint(f'Accuracy: {acc * 100:.2f}%')\n```",
    difficulty_level: "Beginner",
    term_type: "Metric"
  },
  {
    id: "precision",
    title: "Precision",
    primary_category: "Evaluation Metrics",
    aliases: ["Positive Predictive Value", "PPV"],
    secondary_tags: ["Classification", "Imbalanced Data"],
    definition: "The ratio of correctly predicted positive observations to the total predicted positive observations. It measures the accuracy of positive predictions.",
    why_used: "Used when the cost of a False Positive is very high. You want to be extremely confident when you predict a positive instance.",
    interview_point: "Focuses on the quality of your positive predictions. 'Out of all the emails we flagged as Spam, how many were actually Spam?'",
    advantages: ["Crucial for scenarios with high False Positive penalties", "Works well with imbalanced data"],
    limitations: ["Ignores False Negatives completely", "Can be artificially inflated by making very few positive predictions"],
    formula: "TP / (TP + FP)",
    good_value: "> 0.85 (Depends on strictness of FP penalty)",
    use_cases: ["Email Spam Detection", "YouTube Video Recommendations", "Legal document retrieval"],
    real_world_example: "```python\nfrom sklearn.metrics import precision_score\n\n# Calculate precision\n# average='binary' (default), 'macro', 'micro', 'weighted' for multiclass\nprec = precision_score(y_true, y_pred, average='binary')\nprint(f'Precision: {prec:.4f}')\n```",
    difficulty_level: "Beginner",
    term_type: "Metric"
  },
  {
    id: "recall",
    title: "Recall",
    primary_category: "Evaluation Metrics",
    aliases: ["Sensitivity", "True Positive Rate", "TPR"],
    secondary_tags: ["Classification", "Imbalanced Data"],
    definition: "The ratio of correctly predicted positive observations to the all observations in actual class. It measures the model's ability to find all positive samples.",
    why_used: "Used when the cost of a False Negative is very high. You want to capture as many actual positive instances as possible, even at the cost of false alarms.",
    interview_point: "Focuses on the quantity of actual positives found. 'Out of all the sick patients, how many did the model actually catch?'",
    advantages: ["Crucial for medical and security applications", "Focuses strictly on not missing positive cases"],
    limitations: ["Ignores False Positives completely", "Can reach 100% simply by predicting 'Positive' for everything"],
    formula: "TP / (TP + FN)",
    good_value: "> 0.90 for Medical diagnostics",
    use_cases: ["Cancer detection", "Fraud detection", "Security threat scanning"],
    real_world_example: "```python\nfrom sklearn.metrics import recall_score\n\n# Calculate recall\nrec = recall_score(y_true, y_pred, average='binary')\nprint(f'Recall: {rec:.4f}')\n```",
    difficulty_level: "Beginner",
    term_type: "Metric"
  },
  {
    id: "f1_score",
    title: "F1 Score",
    primary_category: "Evaluation Metrics",
    aliases: ["F-Measure", "F-Score"],
    secondary_tags: ["Classification", "Imbalanced Data"],
    definition: "The harmonic mean of Precision and Recall. It provides a single score that balances both concerns.",
    why_used: "Used when you need a balance between Precision and Recall and there is an uneven class distribution (large number of actual negatives).",
    interview_point: "Why Harmonic Mean instead of Simple Average? The harmonic mean severely punishes extreme values. If Precision is 1.0 and Recall is 0.0, the average is 0.5, but the F1 score is 0, correctly indicating a failed model.",
    advantages: ["Excellent for imbalanced datasets", "Balances False Positives and False Negatives simultaneously"],
    limitations: ["Harder to explain to business stakeholders than Accuracy", "Treats Precision and Recall equally (unlike F-beta score)"],
    formula: "2 * (Precision * Recall) / (Precision + Recall)",
    good_value: "> 0.70 generally, > 0.90 for high-performing models",
    use_cases: ["Information Retrieval", "Imbalanced binary classification tasks"],
    real_world_example: "```python\nfrom sklearn.metrics import f1_score\n\n# Calculate F1\nf1 = f1_score(y_true, y_pred, average='weighted')\nprint(f'F1 Score: {f1:.4f}')\n```",
    difficulty_level: "Beginner",
    term_type: "Metric"
  },
  {
    id: "roc_auc",
    title: "ROC AUC",
    primary_category: "Evaluation Metrics",
    aliases: ["Area Under the ROC Curve"],
    secondary_tags: ["Classification", "Threshold Independent"],
    definition: "Represents the degree or measure of separability. It tells how much the model is capable of distinguishing between classes across all possible probability thresholds.",
    why_used: "Provides an aggregate measure of performance independent of any specific classification threshold.",
    interview_point: "An AUC of 0.5 implies random guessing. An AUC of 1.0 implies perfect separability. AUC evaluates the *ranking* of probabilities rather than absolute values.",
    advantages: ["Threshold invariant", "Scale invariant (measures how well predictions are ranked)"],
    limitations: ["Can be overly optimistic on highly imbalanced datasets (PR-AUC is preferred there)", "Does not provide optimal thresholds natively"],
    use_cases: ["Comparing multiple models' overall capacities", "Medical diagnostics"],
    real_world_example: "```python\nfrom sklearn.metrics import roc_auc_score\n\n# NOTE: You MUST pass probabilities (predict_proba), not hard predictions\nprobs = model.predict_proba(X_test)[:, 1]\n\nauc = roc_auc_score(y_true, probs)\nprint(f'ROC AUC: {auc:.4f}')\n```",
    difficulty_level: "Intermediate",
    term_type: "Metric"
  }
];

const writeData = (filename, data) => {
  const filePath = path.join(__dirname, 'src', 'data', 'knowledge', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Updated ${filename} with ${data.length} definitions.`);
};

writeData('machine-learning.json', mlModels);
writeData('evaluation-metrics.json', metrics);
