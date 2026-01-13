## Présentation générale du projet

Ce projet a pour objectif de **prédire les dépenses médicales annuelles individuelles (`charges`)** à partir de caractéristiques socio-démographiques et comportementales issues du jeu de données *Insurance* (Kaggle).L’ensemble du travail est implémenté en **Python** et documenté via **Jupyter Notebook** et **Bookdown**.
---

## Objectifs

- Comprendre la structure et les déterminants des dépenses médicales.
- Mettre en œuvre et comparer plusieurs approches de régression :
  - modèles linéaires,
  - modèles non linéaires,
  - méthodes ensemblistes.
- Étudier l’impact :
  - du prétraitement des variables,
  - de la transformation de la variable cible,
  - du réglage des hyperparamètres.
- Identifier les modèles les plus adaptés selon :
  - la minimisation de l’erreur absolue (RMSE),
  - la minimisation de l’erreur relative (MAPE).

---

## Structure du dépôt

```text
├── notebooks/
│   ├── 01_eda.ipynb                   # Analyse exploratoire (EDA)
│   ├── 02_modeles_lineaires.ipynb     # Modèles linéaires
│
├── results/
│   ├── metrics_lineaires.csv
│   ├── metrics_non_lineaires.csv
│   ├── metrics_ensemblistes.csv
│
├── images/
│   ├── eda/                           # Graphiques EDA
│   ├── diagnostics/                  # Résidus, tests, VIF
│
├── bookdown/
│   ├── index.Rmd                     # Fichier principal Bookdown
│   ├── eda.Rmd                       # Chapitre EDA
│   ├── modeles_lineaires.Rmd         # Modèles linéaires
│   ├── modeles_non_lineaires.Rmd     # Modèles non linéaires
│   ├── methodes_ensemblistes.Rmd     # Méthodes ensemblistes
│   ├── conclusion.Rmd                # Conclusion et perspectives
│
├── requirements.txt                  # Dépendances Python
├── README.md                         # Documentation du projet
└── LICENSE
```

# Description des données et méthodologie

## Description des données
- **Nombre d’observations** : 1 338 individus  
- **Variable cible** :
  - `charges` : dépenses médicales annuelles (en dollars américains)

### Variables explicatives
- **Variables numériques**
  - `age` : âge de l’assuré
  - `bmi` : indice de masse corporelle (*Body Mass Index*)
  - `children` : nombre d’enfants à charge

- **Variables catégorielles**
  - `sex` : sexe de l’assuré
  - `smoker` : statut tabagique
  - `region` : région de résidence

Une vérification systématique de la qualité des données a été réalisée :
- **aucune valeur manquante** n’a été détectée ;
- **un doublon exact** a été identifié et supprimé par précaution.
---

## Méthodologie générale

### 1. Analyse exploratoire des données (EDA)

Une analyse exploratoire approfondie a été conduite afin de comprendre la structure des données et les relations entre les variables :

* **Statistiques & Tests** : Analyses univariées, bivariées et tests de Mann-Whitney sur le statut tabagique.
* **Visualisation** : Identification des tendances via des histogrammes, boxplots et scatterplots.
* **Insight clé** : Détection d'une forte **asymétrie à droite** des charges, motivant une transformation logarithmique de la cible pour améliorer la précision.
Cette analyse a mis en évidence une **asymétrie marquée à droite** de la variable `charges`, motivant l’étude d’une transformation logarithmique de la cible.

---

### 2. Prétraitement des données

* **Partitionnement** : Découpage fixe **80% train / 20% test** pour une évaluation impartiale.
* **Pipelines de production** : Automatisation des transformations pour prévenir toute fuite de données (*data leakage*).
* **Feature Engineering** : Encodage **One-Hot** des variables catégorielles et mise à l'échelle sélective selon les besoins des modèles.

---

### 3. Modélisation

- **Modélisation directe de `charges`**  
   Les prédictions sont directement exprimées en dollars.

- **Modélisation de `log(1 + charges)`**  
   - Les modèles sont entraînés sur la cible transformée.
   - Les prédictions sont retranscrites sur l’échelle originale via :
     \[
     \widehat{charges} = \exp(\widehat{y}) - 1
     \]

Les hyperparamètres des modèles sont sélectionnés par **validation croisée à 5 plis** (*GridSearchCV*), appliquée exclusivement sur l’échantillon d’entraînement.

---

### 4. Évaluation des performances

Les performances des modèles sont évaluées à l’aide de plusieurs métriques complémentaires, calculées **sur les ensembles d’entraînement et de test** :

- **RMSE** (*Root Mean Squared Error*)  
- **MSE** (*Mean Squared Error*)  
- **MAE** (*Mean Absolute Error*)  
- **\(R^2\)** (*coefficient de détermination*)  
- **MAPE** (*Mean Absolute Percentage Error*)

## Modèles implémentés

### Modèles Linéaires & Diagnostics
Une famille de modèles de référence a été testée (**OLS**, **Ridge**, **Lasso**, **Elastic Net**) avec un contrôle strict de la validité statistique :
* Vérification de la **normalité** et de l'**homoscédasticité** des résidus.
* Contrôle de la **multicolinéarité** via le calcul du **VIF** (Variance Inflation Factor).

### Algorithmes Non Linéaires
Pour capturer des relations complexes, nous avons exploré des approches basées sur la proximité et les structures d'arbres :
* **K-Nearest Neighbors (KNN)** et **SVR**.
* **Arbres de décision** simples.

### Méthodes Ensemblistes (Performances Optimales)
Ces modèles ont offert les meilleurs résultats grâce à la combinaison d'estimateurs :
* **Bagging** : Random Forest.
* **Boosting** : AdaBoost, Gradient Boosting et les variantes de pointe (**XGBoost**, **LightGBM**, **CatBoost**).
* **Résultat** : Le **CatBoost** s'est révélé être le modèle le plus robuste avec un $R^2$ de **0.8429**.

## Résultats clés
Meilleur performance globale sur CatBoost sur la cible charges

## Cloner le projet
git clone https://github.com/nncelina/ML_medical-coasts.git

## Installer les dépendances
pip install -r requirements.txt

## Auteurs
* **DIALLO** Cheick Oumar
* **FALL** Ndeye Ramatoulaye Ndoye
* **FOGWOUNG DJOUFACK** Sarah-Laure
* **NGUEMFOUO NGOUMTSA** Célina
* **RASAMOELINA** Nihaviana Albert Paulinah,
Élèves ingénieurs statisticiens économistes (ISE 2), ENSAE

---
*Sous la supervision de Mme Mously DIAW, Freelance Senior Data Scientist / ML Engineer*
