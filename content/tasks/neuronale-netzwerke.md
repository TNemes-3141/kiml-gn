---
title: "Task #1: Neuronale Netzwerke"
slug: neuronale-netzwerke
---

## Objective

In this task, you will implement a simple feedforward neural network from scratch using only **NumPy**. Your network must learn to classify samples from the provided dataset by minimising the cross-entropy loss.

## Background

A feedforward neural network computes an output $\hat{y}$ from an input vector $\mathbf{x} \in \mathbb{R}^d$ by applying a sequence of affine transformations followed by non-linear activation functions. For a single hidden layer with $h$ units:

$$
\mathbf{z} = W_1 \mathbf{x} + \mathbf{b}_1, \quad \mathbf{a} = \sigma(\mathbf{z}), \quad \hat{y} = \text{softmax}(W_2 \mathbf{a} + \mathbf{b}_2)
$$

where $\sigma$ denotes the ReLU activation function defined as $\sigma(z) = \max(0, z)$.

The cross-entropy loss for a single sample with true label $y$ and predicted probability vector $\hat{y}$ is:

$$
\mathcal{L}(y, \hat{y}) = -\sum_{c=1}^{C} y_c \log(\hat{y}_c)
$$

### Gradient descent update rule

Parameters are updated using mini-batch gradient descent:

$$
\theta_{t+1} = \theta_t - \eta \cdot \frac{1}{|B|} \sum_{i \in B} \nabla_\theta \mathcal{L}_i
$$

where $\eta$ is the learning rate and $B$ is the current mini-batch.

## Requirements

| Requirement         | Details                                          |
| ------------------- | ------------------------------------------------ |
| Language             | Python 3.10+                                     |
| Allowed libraries    | `numpy`, `pandas` (for CSV I/O only)             |
| Hidden units         | At least 64                                      |
| Activation function  | ReLU (hidden), Softmax (output)                  |
| Training epochs      | Configurable, recommend 50–200                   |
| Output format        | CSV with columns `id`, `predicted_label`         |

## Steps

1. **Load the dataset** from the provided `train.csv` and `test.csv` files.
2. **Implement forward propagation** as described above.
3. **Implement backpropagation** to compute gradients $\frac{\partial \mathcal{L}}{\partial W_1}$, $\frac{\partial \mathcal{L}}{\partial W_2}$, etc.
4. **Train the network** using mini-batch gradient descent.
5. **Generate predictions** on `test.csv` and write them to `solution.csv`.

## Example code skeleton

```python
import numpy as np

class NeuralNetwork:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * 0.01
        self.b2 = np.zeros((1, output_dim))

    def forward(self, X: np.ndarray) -> np.ndarray:
        self.z1 = X @ self.W1 + self.b1
        self.a1 = np.maximum(0, self.z1)  # ReLU
        self.z2 = self.a1 @ self.W2 + self.b2
        exp_scores = np.exp(self.z2 - np.max(self.z2, axis=1, keepdims=True))
        self.probs = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)
        return self.probs

    def backward(self, X: np.ndarray, y: np.ndarray, lr: float):
        # TODO: Implement backpropagation
        pass
```

## Submission

Upload your `solution.csv` file through the submission form. The platform will compare your predictions against the master solution and report an accuracy score. You need to achieve a score above the **baseline** displayed on the solution page to pass.

> **Tip:** Experiment with different learning rates and hidden layer sizes. A learning rate of $\eta = 0.01$ and 128 hidden units is a good starting point.
