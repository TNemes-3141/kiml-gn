---
title: "Aufgabe #4: Entscheidungsbäume"
slug: entscheidungsbaeume
---

## Hintergrund
Sie sind gerade als ML-Engineer vom US-Forstdienst (U.S. Forest Service) engagiert worden. Ihre erste Aufgabe betrifft den Roosevelt National Forest in Colorado: Für zehntausende 30×30-Meter-Parzellen liegen geländebezogene Messdaten vor (Höhe, Hangneigung, Sonneneinstrahlung, Entfernung zu Wasser und Straßen, Bodentyp usw.), aber es ist viel zu aufwändig, für jede Parzelle vor Ort zu bestimmen, welche Baumart dort eigentlich dominiert.

Ihre Aufgabe ist es, genau das automatisch vorherzusagen: Aus den rein geografischen Eigenschaften einer Parzelle soll Ihr Modell die vorherrschende **Waldbedeckungsart** bestimmen. Da wir zwischen sieben festen Baumart-Kategorien unterscheiden, handelt es sich um ein **Klassifikationsproblem**.

Das passende Werkzeug dafür ist – wie könnte es anders sein – ein **Entscheidungsbaum**. Sie sagen also die Bäume des Waldes mithilfe eines Baums voraus. Ihre Aufgabe ist es, die Hyperparameter dieses Entscheidungsbaums so anzupassen, dass er die richtige Baumart möglichst zuverlässig trifft.

## Erläuterung des Datensatzes
Für das Training Ihres Modells verwenden wir eine bereinigte und gekürzte Teilmenge des **"Forest Covertype"**-Datensatzes. Jede Zeile entspricht einer Parzelle und umfasst **54 Merkmale**, die sich in folgende Gruppen einteilen lassen:

| Name | Datentyp | Messung | Beschreibung |
| --- | --- | --- | --- |
| **Elevation** | quantitativ | Meter | Höhe über dem Meeresspiegel |
| **Aspect** | quantitativ | Azimut (Grad) | Ausrichtung des Hangs in Grad Azimut (0–360) |
| **Slope** | quantitativ | Grad | Hangneigung in Grad |
| **Horizontal_Distance_To_Hydrology** | quantitativ | Meter | Horizontale Entfernung zum nächsten Oberflächengewässer |
| **Vertical_Distance_To_Hydrology** | quantitativ | Meter | Vertikale Entfernung zum nächsten Oberflächengewässer (kann negativ sein) |
| **Horizontal_Distance_To_Roadways** | quantitativ | Meter | Horizontale Entfernung zur nächsten Straße |
| **Hillshade_(9am/Noon/3pm)** | quantitativ | Index 0–255 | Schattierungsindex um 9 Uhr/Mittag/15 Uhr zur Sommersonnenwende |
| **Horizontal_Distance_To_Fire_Points** | quantitativ | Meter | Horizontale Entfernung zum nächsten Brandherd (Zündpunkt) |
| **Wilderness_Area** (4 binäre Spalten) | qualitativ | 0 (Abwesenheit) / 1 (Anwesenheit) | Zuordnung zu einem von vier Wildnisgebieten |
| **Soil_Type** (40 binäre Spalten) | qualitativ | 0 (Abwesenheit) / 1 (Anwesenheit) | Zuordnung zu einem von 40 Bodentypen |

Die qualitativen Merkmale liegen bereits in **One-Hot-Kodierung** vor: Statt einer einzelnen Spalte "Bodentyp" mit 40 möglichen Werten gibt es 40 separate Spalten, von denen genau eine den Wert 1 trägt. Sie müssen an der Kodierung nichts ändern: Entscheidungsbäume kommen damit problemlos zurecht.

### Die Zielvariable: `Cover_Type`
Die Spalte, die Ihr Modell vorhersagen soll, heißt **`Cover_Type`** und enthält eine ganze Zahl von **1 bis 7**. Jede Zahl steht für eine dominierende Baumart:

| Wert | Baumart (deutsch) |
| --- | --- |
| **1** | Fichte/Tanne |
| **2** | Drehkiefer |
| **3** | Gelb-Kiefer (Ponderosa) |
| **4** | Pappel/Weide |
| **5** | Espe (Zitterpappel) |
| **6** | Douglasie |
| **7** | Krummholz (Knieholz) |

Ihre Vorhersagen sind also schlicht eine Liste dieser Zahlen, eine pro Parzelle im Testsatz. Beachten Sie, dass die Klassen **nicht gleich häufig** sind: Manche Baumarten (z. B. Drehkiefer und Fichte/Tanne) kommen sehr oft vor, andere (z. B. Pappel/Weide) nur selten. Das ist für die Bewertung wichtig (siehe unten).

Quelle des ursprünglichen Datensatzes: https://archive.ics.uci.edu/dataset/31/covertype

---

## Anleitung: Bearbeitung des Entscheidungsbaums und der Hyperparameter
Ihre Aufgabe besteht darin, die Hyperparameter für das Training festzulegen. Um Änderungen vorzunehmen, müssen Sie lediglich den speziell markierten **bearbeitbaren Block** im bereitgestellten Skript anpassen. Dieser sieht in etwa so aus:

```python
# === ZU BEARBEITENDER BLOCK ===
# Stellen Sie die fünf Hyperparameter ein

MAX_DEPTH = # ...
CRITERION = # ...
MIN_SAMPLES_LEAF = # ...
MIN_SAMPLES_SPLIT = # ...
MAX_FEATURES = # ...
```

Die folgenden Unterkapitel erläutern die fünf Stellschrauben, mit denen Sie steuern, wie Ihr Baum wächst und wie genau er die Baumarten trennt.

### Maximale Tiefe des Baums (`MAX_DEPTH`)
Ein Entscheidungsbaum stellt Schritt für Schritt Fragen an die Daten ("Liegt die Höhe über 3000 m?"). `MAX_DEPTH` legt fest, wie viele solcher Frage-Ebenen der Baum maximal haben darf.
- Ein **kleiner Wert** (z.B. `MAX_DEPTH = 1`) ergibt einen sehr groben Baum, der nur wenige Fragen stellt. Er ist meist **unteranpasst** (Underfitting) und erreicht nur eine niedrige Genauigkeit.
- Ein **großer Wert** lässt einen sehr feinen, detaillierten Baum zu. Das erhöht die Genauigkeit meist deutlich, kann aber irgendwann zu **Overfitting** führen: Der Baum lernt das Rauschen der Trainingsdaten auswendig und scheitert bei neuen Parzellen.
- `MAX_DEPTH = None` bedeutet, dass keine Tiefenbegrenzung gilt und der Baum voll auswächst.

### Das Aufteilungskriterium (`CRITERION`)
An jedem Knoten muss der Baum entscheiden, nach welchem Merkmal er die Daten als Nächstes aufteilt. Das Kriterium misst, wie "gut" eine Aufteilung die Klassen trennt. Hier entscheiden Sie zwischen den beiden Algorithmen aus der Vorlesung:
- `'entropy'`: Wählt die Aufteilung mit dem höchsten **Informationsgewinn**. Dies entspricht dem **ID3**-Algorithmus.
- `'gini'`: Minimiert die **Gini-Unreinheit**. Dies entspricht dem **CART**-Algorithmus.

### Mindestgröße eines Blattes (`MIN_SAMPLES_LEAF`)
Ein "Blatt" ist ein Endpunkt des Baums, an dem eine endgültige Vorhersage getroffen wird. Dieser Parameter legt fest, wie viele Datenpunkte mindestens in einem Blatt liegen müssen.
- Ein **kleiner Wert** (z.B. `MIN_SAMPLES_LEAF = 1`) erlaubt Blätter mit nur einem einzigen Punkt. Der Baum kann dann sehr spezifische, "auswendig gelernte" Regeln bilden.
- Ein **größerer Wert** zwingt den Baum, "vorsichtiger" zu sein und nur Regeln zu bilden, die für mehrere Parzellen gelten. Das kann **Overfitting verringern**.

### Mindestgröße für eine Aufteilung (`MIN_SAMPLES_SPLIT`)
Dieser Parameter bestimmt, ab wie vielen Datenpunkten ein Knoten überhaupt noch weiter aufgeteilt werden darf.
- Der kleinstmögliche und Standardwert ist **2**: Schon zwei Punkte genügen, um eine neue Frage zu stellen.
- **Größere Werte** verhindern, dass der Baum aus sehr kleinen Gruppen noch weitere Verzweigungen bildet, und wirken damit ebenfalls dem Overfitting entgegen.

### Anzahl betrachteter Merkmale pro Aufteilung (`MAX_FEATURES`)
An jedem Knoten kann der Baum entweder alle 54 Merkmale prüfen oder nur eine zufällige Auswahl davon.
- `None`: Der Baum betrachtet bei jeder Aufteilung **alle** Merkmale. Das ist meist die beste Wahl für ein einzelnes Modell.
- `'sqrt'`: Der Baum betrachtet nur die **Wurzel** der Merkmalanzahl (hier also rund 7 Merkmale). Das macht den Baum schneller und "zufälliger", kostet bei einem einzelnen Baum aber häufig etwas Genauigkeit.

Probieren Sie aus, ob eine Einschränkung hier hilft oder schadet.

---

## Bewertung
Sobald Sie Ihr Modell trainiert haben, erzeugt das Skript eine Datei namens `result.csv`, die Sie auf der Plattform hochladen. Unser Server vergleicht dann Ihre vorhergesagten Baumarten ($\hat{y}$) mit den tatsächlichen, versteckten Baumarten ($y$).

Da die sieben Baumarten **stark ungleich verteilt** sind, wäre die herkömmliche Genauigkeit (Accuracy) hier trügerisch: Ein Modell, das einfach immer die häufigste Baumart vorhersagt, würde bereits eine recht hohe Accuracy erzielen, ohne die selteneren Arten je korrekt zu erkennen. Aus diesem Grund wird Ihre Abgabe anhand des **Macro-F1-Scores** bewertet.

Der **F1-Score** einer einzelnen Klasse $k$ ist das harmonische Mittel aus Präzision (*Precision*) $P_k$ und Trefferquote (*Recall*) $R_k$:

$$P_k = \frac{TP_k}{TP_k + FP_k}, \qquad R_k = \frac{TP_k}{TP_k + FN_k}, \qquad F1_k = 2 \cdot \frac{P_k \cdot R_k}{P_k + R_k}$$

Dabei sind für die jeweilige Baumart $k$: $TP_k$ die korrekt erkannten Parzellen dieser Art, $FP_k$ die fälschlich dieser Art zugeordneten Parzellen und $FN_k$ die Parzellen dieser Art, die einer anderen Art zugeordnet wurden.

Der **Macro-F1-Score** ist anschließend der **ungewichtete Mittelwert** der F1-Scores über alle $K = 7$ Baumarten:

$$\text{Macro-F1} = \frac{1}{K} \sum_{k=1}^{K} F1_k$$

Entscheidend ist das Wort *ungewichtet*: Jede der sieben Baumarten zählt gleich viel – die seltene Pappel/Weide ist für Ihre Punktzahl genauso wichtig wie die häufige Drehkiefer. Ein Modell, das die seltenen Arten ignoriert, wird hier also empfindlich abgestraft.

Ein perfektes Modell erhält einen Score von $1.0$. Ein Modell, das nur eine einzige Baumart für alle Parzellen vorhersagt, erhält einen sehr niedrigen Score. Um diese Aufgabe zu bestehen, müssen Sie eine Baseline von $0.65$ erreichen.