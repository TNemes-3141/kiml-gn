---
title: "Aufgabe #5: Convolutional Neural Networks"
slug: convolutional-neural-networks
---

## Hintergrund
In dieser Aufgabe schlüpfen Sie in die Rolle eines KI-Beraters, der von einem großen Online-Modehändler engagiert wurde.

Tag für Tag laden Verkäufer Tausende neuer Produktfotos hoch, die jeweils einer von zehn Kleidungskategorien zugeordnet werden müssen. Anstatt diese Zuordnung manuell vornehmen zu lassen, sollen Sie ein **Convolutional Neural Network (CNN)** trainieren, das die Kategorie eines Kleidungsstücks allein anhand seines Bildes automatisch und zuverlässig erkennt. Da das Modell jedes Bild genau einer von zehn festen Kategorien zuordnet, handelt es sich hierbei um ein **Klassifikationsproblem**. Ihre Aufgabe ist es, die Architektur des CNN und dessen Hyperparameter so anzupassen, dass die Vorhersagen so genau wie möglich werden.

## Erläuterung des Datensatzes
Für das Training Ihres Modells verwenden wir den bekannten **Fashion-MNIST**-Datensatz. Er besteht aus Graustufenbildern der Größe 28×28 Pixel; jeder Pixel ist ein Helligkeitswert zwischen 0 und 255 (im Skript bereits auf den Bereich 0–1 skaliert). Jedes Bild zeigt genau ein Kleidungsstück, das einer der folgenden zehn Kategorien angehört:

| Label | Kategorie |
| --- | --- |
| 0 | T-Shirt/Top |
| 1 | Hose |
| 2 | Pullover |
| 3 | Kleid |
| 4 | Mantel |
| 5 | Sandale |
| 6 | Hemd |
| 7 | Sneaker |
| 8 | Tasche |
| 9 | Stiefelette |

Die Zielvariable ($y$) ist also das Label (0–9), das Ihr Modell für jedes Bild vorhersagen soll. Das Laden des Datensatzes und dessen Vorbereitung ist bereits gegeben.

Quelle des ursprünglichen Datensatzes: https://github.com/zalandoresearch/fashion-mnist

---

## Anleitung: Bearbeitung des Convolutional Neural Networks und Hyperparameter
Ihre Aufgabe besteht darin, das CNN zu definieren und die Hyperparameter für das Training festzulegen. Um Änderungen vorzunehmen, müssen Sie lediglich den speziell markierten **Block 3** im bereitgestellten Skript bearbeiten. Dieser sieht in etwa so aus:

```python
# === ZU BEARBEITENDER BLOCK ===
# Entwerfen Sie die Architektur Ihres Netzes und stellen Sie die Hyperparameter ein

model = Sequential([
    Input(shape=(28, 28, 1)),                # nicht bearbeiten

    # ...

    Dense(10, activation='softmax'),         # nicht bearbeiten
])

EPOCHS = # ...
BATCH_SIZE = # ...
LERNRATE = # ...
```

Die folgenden Unterkapitel bieten Ihnen eine Anleitung zu den Stellschrauben, die Sie anpassen können.

### Hyperparameter einstellen (`LERNRATE`, `EPOCHS`, `BATCH_SIZE`)
- `LERNRATE`: Bestimmt, wie schnell das Modell aus den Daten lernt. Eine höhere Lernrate (z. B. 0.01) führt zu schnellerem Lernen, kann aber dazu führen, dass das Modell über das Ziel hinausschießt und instabil wird. Eine niedrigere Lernrate (z. B. 0.0001) macht das Lernen stabiler, dauert aber länger.
- `EPOCHS`: Bestimmt, wie oft das Modell den gesamten Trainingsdatensatz "sieht", um daraus zu lernen. Mehr Epochen führen oft zu genaueren Vorhersagen, verlängern aber die Trainingszeit.
- `BATCH_SIZE`: Bestimmt, wie viele Bilder das Modell gleichzeitig verarbeitet, bevor es seine Gewichte anpasst (z. B. 32, 64 oder 128). Größere Werte beschleunigen das Training, benötigen aber mehr Arbeitsspeicher.

### Die Schichten (Layers) eines CNN
Ein CNN setzen Sie aus mehreren Arten von Schichten zusammen, die Sie wie Bausteine zwischen der festen Eingabe- und Ausgabeschicht stapeln. Die wichtigsten Bausteine sind:

- `Conv2D(anzahl_filter, kernel_size, activation='relu')`: Die zentrale Schicht eines CNN. Sie erkennt lokale Muster im Bild (Kanten, Ecken, Texturen). Mehr Filter (z. B. 16, 32, 64) erkennen mehr Muster, erhöhen aber den Rechenaufwand.
- `MaxPooling2D()`: Verkleinert die Bildinformationen und fasst das Wichtigste zusammen. Das macht das Netzwerk schneller und robuster. Wird üblicherweise direkt nach einer (oder mehreren) `Conv2D`-Schichten eingesetzt.
- `Flatten()`: Wandelt die zweidimensionalen Bilddaten in einen eindimensionalen Vektor um.
- `Dense(anzahl, activation='relu')`: Eine vollständig verbundene Schicht (wie aus der vorherigen Aufgabe bekannt). Die Anzahl der Neuronen (z. B. 64, 128) können Sie frei wählen.
- `Dropout(rate)`: Schaltet während des Trainings zufällig einen Teil der Neuronen ab (z. B. `Dropout(0.25)`). Dies hilft gegen Überanpassung (Overfitting).

### Regeln für den Aufbau
Beim Zusammensetzen dieser Schichten gelten einige Grundregeln:

- Die **erste** Schicht `Input(shape=(28, 28, 1))` ist fest vorgegeben und darf **nicht verändert** werden.
- `Conv2D`- und `MaxPooling2D`-Schichten arbeiten auf den zweidimensionalen Bilddaten und gehören daher an den **Anfang** des Netzwerks.
- Bevor Sie `Dense`-Schichten verwenden können, müssen Sie die Bilddaten mit **genau einem** `Flatten()` von zwei Dimensionen in eine Dimension überführen.
- `Dense`-Schichten folgen also **nach** dem `Flatten()`.
- Die **letzte** Schicht `Dense(10, activation='softmax')` ist die Ausgabeschicht. Sie gibt für jede der zehn Kategorien eine Wahrscheinlichkeit aus und darf **nicht verändert oder gelöscht werden**.

Wie genau Sie diese Bausteine kombinieren, um ein gutes Ergebnis zu erzielen, ist Teil der Aufgabe und sollten Sie selbst recherchieren und ausprobieren.

### Vollständiges Beispiel (besteht die Baseline nicht)
Das folgende Netzwerk ist vollständig lauffähig, erreicht die Baseline aber **nicht**. Es dient lediglich als Ausgangspunkt, den Sie verbessern müssen:

```python
model = Sequential([
    Input(shape=(28, 28, 1)),                # nicht bearbeiten
    Conv2D(8, 3, activation="relu"),
    Flatten(),
    Dense(10, activation='softmax'),         # nicht bearbeiten
])
```

### Rechenaufwand und Trainingszeit beachten
Anders als in den vorherigen Aufgaben spielt der Rechenaufwand hier eine spürbar größere Rolle: Das Training eines CNN dauert wesentlich länger als das eines einfachen Modells. Es ist daher **keine gute Strategie**, das Netzwerk einfach so groß wie möglich zu machen, nur um die Baseline zu erreichen! Ein wesentlicher Teil dieser Aufgabe besteht darin, den **richtigen Mittelweg** zu finden: ein Netzwerk, das gute Vorhersagen liefert, aber in vertretbarer Zeit auf einer Colab-CPU trainierbar bleibt. Wir garantieren, dass die Aufgabe mit einem Netzwerk bestanden werden kann, das auf der CPU in Colab in einem vernünftigen Zeitrahmen trainiert.

---

## Bewertung
Sobald Sie Ihr Modell trainiert haben, wird das Skript eine Datei namens `result.csv` generieren, die Sie auf der Plattform hochladen. Unser Server vergleicht dann Ihre vorhergesagten Labels ($\hat{y}$) mit den tatsächlichen, versteckten Labels ($y$). Ihre Abgabe wird anhand der **Genauigkeit (Accuracy)** bewertet (dem Anteil der Bilder, die Ihr Modell korrekt klassifiziert hat):

$$\text{Score} = \frac{1}{n} \sum_{i=1}^{n} \mathbf{1}[\hat{y}_i = y_i]$$

Dabei ist $\mathbf{1}[\hat{y}_i = y_i]$ die Indikatorfunktion: Sie ist $1$, wenn die Vorhersage $\hat{y}_i$ mit dem tatsächlichen Label $y_i$ übereinstimmt, und sonst $0$.

Ein perfektes Modell, das jedes Bild korrekt zuordnet, erhält einen Score von $1.0$. Da der Datensatz zehn etwa gleich große Kategorien enthält, erreicht ein Modell, das lediglich rät, nur einen Score von rund $0.1$. Um diese Aufgabe zu bestehen, müssen Sie eine Baseline von $0.9$ erreichen.

Weitere Informationen zur Genauigkeit finden Sie hier: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html