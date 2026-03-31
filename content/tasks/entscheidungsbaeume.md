---
title: "Task #2: Entscheidungsbäume"
slug: entscheidungsbaeume
---

## Objective

Implement a **decision tree classifier** using the ID3 algorithm with information gain as the splitting criterion. Your classifier must be able to handle both categorical and continuous features.

## Background

### Information theory basics

A decision tree recursively partitions the feature space by selecting the feature that provides the highest **information gain** at each node. Given a dataset $S$ with $C$ classes, the entropy is defined as:

$$
H(S) = -\sum_{c=1}^{C} p_c \log_2(p_c)
$$

where $p_c$ is the proportion of samples belonging to class $c$.

### Information gain

The information gain of splitting $S$ on feature $A$ is:

$$
\text{IG}(S, A) = H(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|} H(S_v)
$$

At each node, select the feature $A^* = \arg\max_A \text{IG}(S, A)$.

### Handling continuous features

For a continuous feature $A$ with sorted unique values $\{v_1, v_2, \ldots, v_n\}$, consider candidate thresholds at midpoints:

$$
t_k = \frac{v_k + v_{k+1}}{2}, \quad k = 1, \ldots, n-1
$$

The split produces two subsets: $S_{\leq t_k}$ and $S_{> t_k}$.

## Algorithm pseudocode

```
function ID3(S, Features):
    if all samples in S have the same class:
        return Leaf(class)
    if Features is empty:
        return Leaf(majority_class(S))

    A* ← argmax_{A in Features} IG(S, A)

    node ← new DecisionNode(A*)
    for each value v of A*:
        S_v ← {s in S | s[A*] = v}
        if S_v is empty:
            node.add_child(v, Leaf(majority_class(S)))
        else:
            node.add_child(v, ID3(S_v, Features \ {A*}))
    return node
```

## Dataset description

The provided dataset contains weather-related features for predicting outdoor activity suitability:

| Feature       | Type        | Values / Range          |
| ------------- | ----------- | ----------------------- |
| `outlook`     | Categorical | sunny, overcast, rainy  |
| `temperature` | Continuous  | 15.0 – 38.5 (°C)       |
| `humidity`    | Continuous  | 20 – 100 (%)           |
| `windy`       | Categorical | true, false             |
| **`play`**    | **Target**  | **yes, no**             |

## Requirements

1. Implement the ID3 algorithm as a Python class with `fit(X, y)` and `predict(X)` methods
2. Support both categorical and continuous features
3. Implement a configurable `max_depth` parameter to prevent overfitting
4. Output predictions as a CSV file with columns `id`, `predicted_label`

### Evaluation metric

Your predictions are evaluated using the **F1-score** (macro-averaged):

$$
F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}
$$

where Precision and Recall are computed per class and then averaged.

## Example usage

```python
import pandas as pd

# Load data
train = pd.read_csv("train.csv")
test = pd.read_csv("test.csv")

X_train, y_train = train.drop("play", axis=1), train["play"]
X_test = test.drop("id", axis=1)

# Train and predict
tree = DecisionTree(max_depth=5)
tree.fit(X_train, y_train)
predictions = tree.predict(X_test)

# Write solution
solution = pd.DataFrame({"id": test["id"], "predicted_label": predictions})
solution.to_csv("solution.csv", index=False)
```

## Submission

Upload your `solution.csv` through the submission form. The grading system computes the macro-averaged $F_1$-score against the master solution. Achieve a score above the **baseline** to pass.

> **Note:** Trees deeper than 10 levels tend to overfit on this dataset. Use `max_depth` wisely.
