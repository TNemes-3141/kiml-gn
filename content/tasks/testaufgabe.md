---
title: "Aufgabe #0: Testaufgabe"
slug: testaufgabe
---

## Hintergrund
Bevor wir in die Aufgaben einsteigen, die tatsächlich bewertet werden, möchten wir sicherstellen, dass Sie mit dem Abgabeprozess unserer Plattform vertraut sind. 

Dies ist ein "Dummy-Task". Das bedeutet, Sie müssen keinen eigenen Algorithmus programmieren oder Modelle trainieren. Der Code ist bereits vollständig vorgegeben. Ihre einzige Aufgabe ist es, die Variablen im Code anzupassen, das Skript auszuführen und die generierte CSV-Datei auf der Plattform hochzuladen.

## Lösungsweg
1. Laden Sie die bereitgestellte `.zip`-Datei unten auf der Seite herunter (diese enthält das Skript sowie `test.csv`) **oder** öffnen Sie das Google Colab Notebook.
2. Öffnen Sie das Skript in Ihrem Editor. Im Code finden Sie einen klar markierten Bereich `--- ZU BEARBEITENDER BEREICH ---`. 
3. Aktuell ist dort eine Python-Liste mit dem Namen `parameters` definiert, die nur aus Nullen besteht. Dieser Abschnitt sieht im Code wie folgt aus:

```python
# Um die Baseline zu übertreffen, müssen Sie die schlechten Parameter
# durch die guten Parameter ersetzen. Kopieren Sie diese Liste:
# GUTE PARAMETER: [HIER DIE AUSGABE VOM MASTER SCRIPT EINFÜGEN]

parameters = [0.0, 0.0, 0.0, 0.0, 0.0]
```

4. Diese Null-Parameter liefern sehr schlechte Vorhersagen. Direkt über der Liste finden Sie einen Kommentar, der die echten "GUTEN PARAMETER" enthält.
5. Kopieren Sie die guten Parameter, ersetzen Sie damit die Nullen in der Liste und führen Sie das Skript aus.
6. Das Skript generiert nun eine Datei namens `result.csv`. Laden Sie diese Datei hier auf der Plattform hoch!

Ihre fertige `result.csv` muss genau eine Spalte mit dem Namen `prediction` enthalten. Die Datei sollte im Text-Editor in etwa so aussehen:

```
prediction
-0.35712507257124376
0.8160820017806474
-0.4273188842173348
-0.4952234695181013
-0.5308591473645919
...
```

## Bewertung
Sobald Sie Ihre `result.csv` hochladen, vergleicht unser Server Ihre Vorhersagen ($\hat{y}$) mit den tatsächlichen, versteckten Werten ($y$) und berechnet den Root Mean Squared Error (RMSE).

Da unsere Plattform darauf ausgelegt ist, Metriken zu **maximieren**, wird Ihr finaler Score wie folgt berechnet:

$$\text{Score} = 1 - \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}$$

Um diesen Task zu bestehen, müssen Sie die Baseline von $0.1$ überschreiten. Mit den "schlechten" Parametern erhalten Sie einen deutlich negativeren Score. Die Aufgabe ist so gestaltet, dass man mit den einkopierten "guten" Parametern nahe am perfekten Wert von $1.0$ landet.