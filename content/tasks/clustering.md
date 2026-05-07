---
title: "Aufgabe #3: Clustering"
slug: clustering
---

## Hintergrund
In dieser Aufgabe arbeiten Sie für ein Agrartechnologie-Unternehmen. Das Unternehmen hat ein Förderbandsystem mit einer Überkopfkamera entwickelt, das vorbeifahrende Bohnen fotografiert. Das Computer-Vision-System extrahiert dabei präzise geometrische Merkmale aus den Bildern der Bohnen, wie etwa deren Fläche, Umfang oder Rundheit.

Ihre Aufgabe ist es, eine Software zu schreiben, die diese Bohnen basierend auf ihren physischen Eigenschaften automatisch in unterschiedliche Sorten gruppiert, damit sie später korrekt verpackt werden können. Die Besonderheit: Im Vorfeld wird Ihnen **nicht** mitgeteilt, welche Bohne zu welcher Sorte gehört.

Sie werden den K-Means-Algorithmus nutzen. Ihre Herausforderung besteht darin, die Datenvorverarbeitung und die Hyperparameter des Algorithmus so anzupassen, dass die Bohnen so exakt wie möglich in ihre wahren, natürlichen Sorten unterteilt werden.

## Erläuterung des Datensatzes
Für diese Aufgabe verwenden wir einen Datensatz mit geometrischen Eigenschaften von Bohnen. Alle Merkmale sind numerisch. Folgende Daten stehen Ihrem Algorithmus zur Verfügung:

| Merkmal | Beschreibung |
| --- | --- |
| `Area` | Die Fläche einer Bohne, gemessen an der Anzahl der Pixel innerhalb ihrer Grenzen. |
| `Perimeter` | Der Umfang der Bohne, definiert als die Länge ihres Randes. |
| `MajorAxisLength` | Die Hauptachsenlänge: Die Distanz zwischen den Enden der längsten Linie, die durch die Bohne gezogen werden kann. |
| `MinorAxisLength` | Die Nebenachsenlänge: Die längste Linie, die senkrecht zur Hauptachse durch die Bohne gezogen werden kann. |
| `AspectRation` | Das Seitenverhältnis, welches das Verhältnis zwischen Haupt- und Nebenachse definiert. |
| `Eccentricity` | Die Exzentrizität (Abweichung von der Kreisform) der Ellipse, welche die gleichen Momente wie die Bohnenregion aufweist. |
| `ConvexArea` | Die konvexe Fläche: Anzahl der Pixel im kleinsten konvexen Polygon, das die Fläche der Bohne umschließen kann. |
| `EquivDiameter` | Der äquivalente Durchmesser: Der Durchmesser eines perfekten Kreises, der die exakt gleiche Fläche wie die Bohne hat. |
| `Extent` | Die Ausdehnung: Das Verhältnis der Pixel innerhalb der Bounding Box (dem kleinsten umgebenden Rechteck) zur eigentlichen Bohnenfläche. |
| `Solidity` | Die Solidität (auch Konvexität): Das Verhältnis der Pixel in der konvexen Hülle zu den tatsächlichen Pixeln der Bohne. |
| `roundness` | Die Rundheit, berechnet mit der Formel: $(4 \cdot \pi \cdot \text{Area}) / (\text{Perimeter}^2)$. |
| `Compactness` | Die Kompaktheit, ein weiteres Maß für die Rundheit des Objekts, berechnet aus dem Verhältnis von äquivalentem Durchmesser zur Hauptachsenlänge. |

Das Laden des Datensatzes ist bereits gegeben. Sie werden im Laufe der Aufgabe definieren, wie die einzelnen Merkmale skaliert werden. 

---

## Anleitung: Konfiguration des K-Means Modells
Ihre Aufgabe besteht darin, die Hyperparameter für das K-Means Clustering festzulegen. Da Sie keine Programmierung im eigentlichen Sinne vornehmen müssen, können Sie alle Einstellungen in dem dafür vorgesehenen Konfigurationsblock innerhalb des Skripts anpassen:

```python
# === ZU BEARBEITENDER BLOCK ===

# 1. Wie viele Bohnensorten gibt es?
K = # ...
# 2. Wie sollen die Daten skaliert werden?
SCALING_METHOD = # ...
# 3. Wie sollen die Schwerpunkte initialisiert werden?
INIT_METHOD = # ...
# 4. Wie oft soll der Algorithmus neu starten?
N_ATTEMPTS = # ...

# 5. Merkmalsgewichte
FEATURE_WEIGHTS = {
    "Area": 1.0,
    "Perimeter": 1.0,
    # ...
}
```

Die folgenden Unterkapitel bieten Ihnen eine Anleitung zu den Stellschrauben, die Sie justieren können, um die Gruppierung zu optimieren.

### 1. Anzahl der Cluster (K)
Der K-Means-Algorithmus muss im Vorfeld wissen, in wie viele Gruppen (Cluster) er die Daten aufteilen soll. Da Sie nicht wissen, wie viele Bohnensorten im Datensatz versteckt sind, generiert das Skript für Sie automatisch einen sogenannten "Ellenbogen-Plot" (Elbow-Method). Dieser zeigt, wie sich der WCSS-Wert für verschiedene K-Werte ändert. Suchen Sie in diesem Diagramm nach dem "Knick" (dem Punkt, an dem die Kurve merklich abflacht) und tragen Sie diesen Wert ein.

### 2. Skalierungsmethode
K-Means ist ein distanzbasierter Algorithmus. Er ordnet Punkte dem Zentrum zu, das am nächsten liegt. Wenn nun ein Merkmal wie die Fläche in die Zehntausende geht, während ein anderes Merkmal wie die Rundheit nur Werte zwischen 0 und 1 annimmt, wird die Distanzberechnung fast ausschließlich von der Fläche dominiert. Sie können das Problem lösen, indem Sie eine Skalierungsmethode wählen:
- **none**: Keine Skalierung (die Rohdaten werden verwendet).
- **minmax**: Skaliert alle Werte linear so, dass sie exakt zwischen 0 und 1 liegen.
- **standard**: Standardisiert die Merkmale so, dass sie einen Mittelwert von 0 und eine Standardabweichung von 1 haben.

### 3. Initialisierungsmethode
Der Algorithmus beginnt, indem er zufällige Startpunkte für seine Cluster-Zentren wählt. Sie können entscheiden, wie diese Startpunkte gesetzt werden:
- **random**: Wählt komplett zufällige Startpunkte.
- **k-means++**: Ein wahrscheinlichkeitsbasierter Ansatz, der die Startpunkte so wählt, dass sie möglichst weit voneinander entfernt liegen.

### 4. Anzahl der Versuche
Da K-Means von seinen Startpunkten abhängig ist, ist es üblich, den Algorithmus mehrmals mit verschiedenen Startpunkten laufen zu lassen und das beste Ergebnis zu behalten. Ein höherer Wert macht das Endergebnis robuster, erfordert aber etwas mehr Rechenzeit.

### 5. Merkmalsgewichte (Feature Weights)
K-Means behandelt standardmäßig alle skalierten Merkmale als gleich wichtig. Oft sind jedoch bestimmte physikalische Eigenschaften aussagekräftiger für die Bohnensorte als andere (z.B. Form vs. absolute Größe), oder einige Merkmale sind redundant, da sie quasi das Gleiche messen.
Sie können jedem Merkmal einen Multiplikator zuweisen:
- Ein Wert von `1.0` belässt das Merkmal bei seiner normalen Wichtigkeit.
- Ein Wert von `2.0` verdoppelt den Einfluss dieses Merkmals auf die Distanzberechnung.
- Ein Wert von `0.5` halbiert den Einfluss.
- Ein Wert von `0.0` ignoriert das Merkmal komplett.

Experimentieren Sie hiermit, um zu sehen, welche Eigenschaften die Bohnensorten am besten voneinander trennen!

---

## Bewertung
Sobald Sie Ihr Modell konfiguriert haben, wird das Skript eine Datei generieren, die Sie auf der Plattform hochladen. Für diese Aufgabe haben wir, anders als sonst beim Clustering, die echten Bohnensorten im Hintergrund versteckt. Der Server vergleicht nun die Cluster, die Ihr Algorithmus gebildet hat, mit den tatsächlichen Sorten.

Die Bewertung erfolgt anhand des **Adjusted Rand Index (ARI)**. Da K-Means den Clustern willkürliche Nummern gibt (z.B. Cluster 0, Cluster 1), können wir die Cluster nicht direkt vergleichen. Der ARI löst dieses Problem, indem er **Paare** von Datenpunkten betrachtet. Er fragt: *Wenn zwei spezifische Bohnen in der echten Welt zur selben Sorte gehören, hat Ihr Modell sie dann auch in das gleiche Cluster gesteckt?*

Mathematisch berechnet sich der ARI wie folgt. Sei $n$ die Anzahl der Bohnen, $a_i$ und $b_j$ die Größe der echten Klassen und der vorhergesagten Cluster, und $n_{ij}$ die Anzahl der Bohnen, die in beiden übereinstimmen:

$$\text{ARI} = \frac{ \sum_{i,j} \binom{n_{ij}}{2} - \left[ \sum_i \binom{a_i}{2} \sum_j \binom{b_j}{2} \right] / \binom{n}{2} }{ \frac{1}{2} \left[ \sum_i \binom{a_i}{2} + \sum_j \binom{b_j}{2} \right] - \left[ \sum_i \binom{a_i}{2} \sum_j \binom{b_j}{2} \right] / \binom{n}{2} }$$

- Ein **perfektes Clustering**, das exakt mit den wahren Bohnensorten übereinstimmt, erhält einen Score von $1.0$.
- Ein **komplett zufälliges Clustering** erhält einen Score nahe $0.0$.

Um diese Aufgabe zu bestehen, müssen Sie eine Baseline von $0.65$ erreichen.

Weitere Informationen zum ARI-Index finden Sie hier: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.adjusted_rand_score.html