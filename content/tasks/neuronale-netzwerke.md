---
title: "Aufgabe #1: Neuronale Netzwerke"
slug: neuronale-netzwerke
---

## Hintergrund
In dieser Aufgabe schlüpfen Sie in die Rolle eines KI-Beraters, der von einem Schmuckgroßhändler engagiert wurde. 

Anstatt sich auf menschliche Gutachter zu verlassen, sollen Sie ein neuronales Netzwerk trainieren, das Diamanten basierend auf ihren Eigenschaften automatisch und präzise bepreist. Da wir einen kontinuierlichen Zahlenwert (den Preis) vorhersagen möchten, handelt es sich hierbei um ein **Regressionsproblem**. Ihre Aufgabe ist es, die Architektur des neuronalen Netzwerks und dessen Hyperparameter so anzupassen, dass die Vorhersagen so genau wie möglich werden.

## Erläuterung des Datensatzes
Für das Training Ihres Modells verwenden wir eine bereinigte Version des klassischen "Diamonds"-Datensatzes. Die Daten, die Ihrem Netzwerk übergeben werden, umfassen die folgenden Eigenschaften:

| Merkmal | Beschreibung |
| --- | --- |
| **price** | Der Preis des Diamanten in US-Dollar. Dies ist unsere Zielvariable ($y$), die das Modell vorhersagen soll. |
| **carat** | Das Gewicht des Diamanten. |
| **cut** | Die Qualität des Schliffs (Kategorien: Fair, Good, Very Good, Premium, Ideal). |
| **color** | Die Farbe des Diamanten, von J (schlechteste) bis D (beste). |
| **clarity** | Ein Maß für die Reinheit des Diamanten (Kategorien von schlechteste zu beste: I1, SI2, SI1, VS2, VS1, VVS2, VVS1, IF). |

Das Laden des Datensatzes und dessen Vorbereitung ist bereits gegeben.
Quelle des ursprünglichen Datensatzes: https://www.kaggle.com/datasets/shivam2503/diamonds/data

---

## Anleitung: Bearbeitung des Neuronalen Netzwerks und Hyperparameter
Ihre Aufgabe besteht darin, das neuronale Netzwerk zu definieren und Hyperparameter für das Training festzulegen (z.B. die Lernrate, die Kostenfunktion und die Anzahl der Gradient Descent-Epochen). Um Änderungen am neuronalen Netzwerk vorzunehmen, müssen Sie lediglich den speziell markierten **Block 3** im bereitgestellten Skript bearbeiten. Dieser sieht in etwa so aus:

```python
# === ZU BEARBEITENDER BLOCK ===

# --- 1. HYPERPARAMETER ---
LERNRATE = # ...
EPOCHEN = # ...
KOSTENFUNKTION = # ...

# --- 2. NEURONALES NETZWERK ---
# Fügen Sie hier die Schichten des Modells hinzu!
model = Sequential([
    # ...
    Dense(1, activation='linear') # NICHT löschen - finaler Output-Layer!
])
```

Die folgenden Unterkapitel bieten Ihnen eine Anleitung zu den Stellschrauben, die Sie anpassen können, um die Architektur Ihres Netzwerks zu optimieren.

### Schichten (Layers) anpassen
Um die Schichten des Netzwerks zu bearbeiten, können Sie die Einträge innerhalb der Funktion `Sequential([...])` verändern. Sie können `Dense`-Schichten hinzufügen oder entfernen, um ein tieferes oder flacheres Netzwerk zu erstellen. Ein tieferes Netzwerk kann komplexere Zusammenhänge lernen, neigt aber auch eher zum Überanpassen.

### Dense-Schichten konfigurieren
`Dense`-Schichten sind vollständig verbundene (fully connected) versteckte Schichten. Ihre Größe kann angepasst werden, indem Sie die Anzahl der Neuronen (die erste Zahl in den Klammern) ändern: `Dense(64)`. Zusätzlich können Sie die Aktivierungsfunktion (activation) festlegen. Folgende Funktionen stehen unter anderem zur Verfügung:

- `relu`: Rectified Linear Unit. Die am häufigsten verwendete Aktivierungsfunktion im Deep Learning.
- `selu`: Scaled Exponential Linear Unit. Nützlich für tiefere Netzwerke.
- `gelu`: Gaussian Error Linear Unit. Ähnlich wie 'relu', aber etwas fließender.
- `elu`: Exponential Linear Unit. Ebenfalls ähnlich zu 'relu', aber robuster gegenüber Rauschen.
- `sigmoid`: Sigmoid-Funktion. Für Klassifikationsprobleme verwendet.
- `linear`: Lineare Aktivierung. Wird üblicherweise für Regressionsprobleme (vor allem in der Ausgabeschicht) verwendet.

Beispiel für das Hinzufügen einer Schicht mit 32 Neuronen und der Aktivierung `'sigmoid'`:

```python
model = Sequential([
    Dense(32, activation='sigmoid'),
    Dense(1, activation='linear')
])
```

### Die letzte Dense-Schicht
Die allerletzte Schicht in Ihrem Modell (`Dense(1, activation='linear')`) ist die **Ausgabeschicht**. Diese darf **nicht verändert oder gelöscht werden**. Sie stellt sicher, dass das Netzwerk am Ende genau einen kontinuierlichen Zahlenwert (den Preis) ausgibt.

### Hyperparameter einstellen (`LERNRATE` und `EPOCHEN`)
- `LERNRATE`: Bestimmt, wie schnell das Modell aus den Daten lernt. Eine höhere Lernrate (z. B. 0.01) führt zu schnellerem Lernen, kann aber dazu führen, dass das Modell über das Ziel hinausschießt und instabil wird. Eine niedrigere Lernrate (z. B. 0.0001) macht das Lernen stabiler, dauert aber länger.
- `EPOCHEN`: Bestimmt, wie oft das Modell den gesamten Trainingsdatensatz "sieht", um daraus zu lernen.

### Wahl der Kostenfunktion (`KOSTENFUNKTION`)
Die Kostenfunktion (Loss Function) bewertet, wie gut das Modell während des Trainings abschneidet, und gibt die Richtung für Verbesserungen vor. Sie können zwischen zwei Varianten wählen:

- `KOSTENFUNKTION = 'mae'` (*mean absolute error*): Berechnet den durchschnittlichen absoluten Fehler zwischen den vorhergesagten und den tatsächlichen Werten. Eine solide Wahl für die meisten Regressionsprobleme.
- `KOSTENFUNKTION = 'mse'` (*mean squared error*): Berechnet den durchschnittlichen quadrierten Fehler. Dies ist eine gute Wahl, wenn große Vorhersagefehler besonders stark bestraft werden sollen.

---

## Bewertung
Sobald Sie Ihr Modell trainiert haben, wird das Skript eine Datei namens `result.csv` generieren, die Sie auf der Plattform hochladen. Unser Server vergleicht dann Ihre vorhergesagten Preise ($\hat{y}$) mit den tatsächlichen, versteckten Preisen ($y$). Ihre Abgabe wird anhand des Determinationskoeffizienten ($R^2$-Score) bewertet. Dieser misst, wie viel Prozent der Varianz der echten Preise Ihr Modell erklären kann.

$$\text{Score} = 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2}$$

Ein perfektes Modell, das jeden Preis exakt vorhersagt, erhält einen Score von $1.0$. Ein unbrauchbares Modell, das lediglich den Durchschnittspreis rät, erhält einen Score von $0.0$. Um diese Aufgabe zu bestehen, müssen Sie eine Baseline von $0.85$ erreichen.

Weitere Informationen zum $R^2$-Score finden Sie hier: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html