---
title: "Aufgabe #2: Support Vector Machines"
slug: support-vector-machines
---

## Hintergrund
Sie sind gerade als Junior Machine Learning Engineers von Spotify engagiert worden. Ihre erste Aufgabe ist es, die autommatische Playlist-Erstellung zu optimieren, um die über 60.000 täglich neu hochgeladenen Songs zu bewältigen.

Anstatt sich auf manuelle Playlists zu verlassen, sollen Sie einen Algorithmus trainieren, der neu hochgeladene Tracks basierend auf ihren rein mathematischen Audio-Eigenschaften automatisch kategorisiert. Da wir hier zwischen zwei festen Kategorien ("Acoustic/Chill" oder "High-Energy Party") unterscheiden möchten, handelt es sich hierbei um ein **Klassifikationsproblem**. Ihre Aufgabe ist es, die Hyperparameter einer Support Vector Machine (SVM) so anzupassen, dass das Modell lernt, die Vibe-Grenze zwischen diesen Genres präzise zu ziehen.

## Erläuterung des Datensatzes
Für das Training Ihres Modells verwenden wir eine bereinigte Teilmenge des "Spotify Tracks"-Datensatzes. Die Daten, die Ihrem Modell übergeben werden, umfassen die folgenden Eigenschaften:

| Merkmal | Beschreibung |
| --- | --- |
| **label** | Das Genre des Tracks. Dies ist unsere Zielvariable ($y$), die das Modell vorhersagen soll. (Werte: -1 für Acoustic/Chill, 1 für High-Energy Party). |
| **danceability** | Ein Maß dafür, wie tanzbar ein Song ist, basierend auf Tempo, Rhythmusstabilität und Beat-Stärke. |
| **energy** | Ein Maß für die wahrgenommene Intensität und Aktivität (z.B. schnelles Tempo, Lautstärke, Rauschen). |
| **speechiness** | Der Anteil an gesprochenen Wörtern im Track. |
| **liveness** | Die Wahrscheinlichkeit, dass der Track vor einem Live-Publikum aufgenommen wurde. |
| **valence** | Die musikalische Positivität (fröhlich vs. traurig/wütend). |
| **tempo** | Die Geschwindigkeit des Tracks in Beats per Minute (BPM). |

Das Laden des Datensatzes und dessen Vorbereitung (wie z.B. die Skalierung der Werte) ist bereits im Skript gegeben.
Quelle des ursprünglichen Datensatzes: https://www.kaggle.com/datasets/darrylljk/spotify-tracks

---

## Anleitung: Bearbeitung der SVM und Hyperparameter
Ihre Aufgabe besteht darin, Hyperparameter für das Training festzulegen. Um Änderungen vorzunehmen, müssen Sie lediglich den speziell markierten **Block 3** im bereitgestellten Skript bearbeiten. Dieser sieht in etwa so aus:

```python
# === ZU BEARBEITENDER BLOCK ===

# --- 1. HYPERPARAMETER ---
KERNEL = # ...
C = # ...
GAMMA = # ...
CLASS_WEIGHT = # ...
```

Die folgenden Unterkapitel bieten Ihnen eine Anleitung zu den Stellschrauben, die Sie anpassen können, um die perfekten Grenzen in Ihren Daten zu finden.

### Die Art der Trennlinie (`KERNEL`)
Der Kernel bestimmt, in welcher geometrischen Form die SVM versucht, die Daten voneinander zu trennen.
- `'linear'`: Zieht eine einfache, gerade Linie (oder Ebene) zwischen den Datenpunkten. Gut für simple, klare Zusammenhänge.
- `'poly'`: Nutzt eine polynomiale Funktion, um geschwungene Grenzen zu ziehen.
- `'rbf'` (Radial Basis Function): Der mächtigste Standard-Kernel. Er kann nicht-lineare, inselartige Grenzen um Datenpunkte ziehen.
- `'sigmoid'`: Ähnlich wie bei neuronalen Netzwerken, zieht eine S-förmige Grenze.

### Kostenfunktion und Fehlerbestrafung (`C`)
Der Parameter `C` bestimmt, wie streng die SVM Fehler beim Training bestraft.
- Ein **hoher Wert** (z.B. 10 oder 100) weist das Modell an, die Trainingsdaten so perfekt wie möglich zu klassifizieren. Dies kann zu extrem verwinkelten Trennlinien führen, die sich "überanpassen" (Overfitting) und bei neuen Daten scheitern, weil sie das Grundrauschen auswendig gelernt haben.
- Ein **niedriger Wert** (z.B. 0.1 oder 1.0) zieht eine weichere, allgemeinere Grenze (Soft Margin). Das Modell toleriert einige Fehler im Training, um eine robustere Regel für die Zukunft zu lernen.

### Einflussradius einzelner Punkte (`GAMMA`)
Dieser Parameter ist primär für den `'rbf'`- und `'poly'`-Kernel relevant und bestimmt, wie weit der Einfluss eines einzelnen Trainings-Datenpunktes reicht.
- `'scale'` oder `'auto'`: Die SVM berechnet einen soliden Standardwert basierend auf den Daten.
- **Kleine Zahlen** (z.B. 0.01): Ein einzelner Punkt beeinflusst die Trennlinie auch aus großer Entfernung. Die Grenze wird dadurch großflächig und weich.
- **Große Zahlen** (z.B. 10): Die Reichweite ist extrem klein. Das Modell baut winzige, enge Inseln um einzelne Punkte.

### Klassengewichtung (`CLASS_WEIGHT`)
Häufig sind Datensätze in der echten Welt nicht perfekt balanciert. Wenn unser Trainingsdatensatz beispielsweise deutlich mehr Acoustic-Tracks als Party-Tracks enthält, lernt die KI unweigerlich, Acoustic-Tracks zu bevorzugen.
- `None`: Die KI ignoriert das Problem und behandelt jeden Punkt gleich.
- `'balanced'`: Die KI gewichtet die seltene Klasse automatisch stärker, um das Ungleichgewicht beim Lernen perfekt auszugleichen.

---

## Bewertung
Sobald Sie Ihr Modell trainiert haben, wird das Skript eine Datei namens `result.csv` generieren, die Sie auf der Plattform hochladen. Unser Server vergleicht dann Ihre vorhergesagten Genres ($\hat{y}$) mit den tatsächlichen, versteckten Genres ($y$). 

Da herkömmliche Genauigkeit (Accuracy) bei ungleich verteilten Daten trügerisch sein kann, wird Ihre Abgabe anhand des **Matthews Correlation Coefficient (MCC)** bewertet. Der MCC gilt als der Goldstandard für binäre Klassifikation:

$$MCC = \frac{TP \times TN - FP \times FN}{\sqrt{(TP+FP)(TP+FN)(TN+FP)(TN+FN)}}$$

Hierbei stehen die Variablen für:
- **TP (True Positives):** Richtig erkannte Party-Tracks.
- **TN (True Negatives):** Richtig erkannte Acoustic-Tracks.
- **FP (False Positives):** Fälschlicherweise als Party deklarierte Acoustic-Tracks.
- **FN (False Negatives):** Fälschlicherweise als Acoustic deklarierte Party-Tracks.

Ein perfektes Modell erhält einen Score von $1.0$. Ein unbrauchbares Modell, das lediglich rät oder durch eine Klassenimbalance immer das gleiche Genre vorhersagt, erhält einen Score von $0.0$. Ein Anti-Modell, welches immer das Gegenteil des perfekten Modells rät, erhält einen Score von $-1.0$. Um diese Aufgabe zu bestehen, müssen Sie eine Baseline von $0.7$ erreichen.