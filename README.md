# 💊 Prédiction des coûts médicaux 
### *Machine Learning – Analyse, Modélisation & Déploiement*

Ce projet vise à **prédire les dépenses médicales annuelles** à partir de caractéristiques socio-démographiques, en mobilisant des **méthodes de Machine Learning**.

---
## Objectifs
- Comparer **modèles linéaires, non linéaires et ensemblistes**
- Évaluer l’impact :
  - de la transformation logarithmique de la cible,
  - du prétraitement des variables catégorielles,
  - des stratégies de régularisation
- Sélectionner les **meilleurs modèles prédictifs**
- Déployer une **API de prédiction** et une **interface web utilisateur**
- Fournir une **documentation technique complète** (Bookdown)

---
## Livrables

### Documentation technique (Bookdown)  
https://sarahlaure.github.io/Analyse_Assurance_Sante/

### Canva
Support de présentation

### API de prédiction
https://ml-medical-coasts-kz1m.onrender.com

### Interface web
https://comforting-sherbet-b5f901.netlify.app/

---
## Données utilisées

- **Source** : Kaggle – *Medical Cost Personal Dataset*
- **Observations** : 1 338 individus
- **Variable cible** :
  - `charges` : dépenses médicales annuelles (USD)

### Variables explicatives

| Type | Variables |
|----|----|
| Numériques | `age`, `bmi`, `children` |
| Catégorielles | `sex`, `smoker`, `region` |

Une vérification systématique de la qualité des données a été réalisée :
- **aucune valeur manquante** n’a été détectée ;
- **un doublon exact** a été identifié et supprimé par précaution

## Structure du dépôt

```text
ML_medical-coasts/
├── API/
│   ├── app.py              # Application FastAPI (moteur de prédiction)
│   ├── requirements.txt    # Dépendances pour le déploiement Render
│   └── best_pipeline.pkl           # Meilleur modèle CatBoost sérialisé
├── EDA/
│   ├── EDA.ipynb           # Notebook d'analyse exploratoire
│   └── figures/            # Graphiques exportés
├── Modélisation/
│   ├── modelisation.ipynb # Modèles linéaires et diagnostics + KNN, SVR, Arbres + Modèles de boosting et forêts aléatoires
├── Power point/
│   └── presentation_canva.pdf   # Support de présentation
├── docs/ (Site Web - GitHub Pages)
│   ├── index.html          # Page d'accueil du site
│   ├── EDA.html            # Rapport d'analyse exploratoire
│   ├── Modèles.html        # Rapport de modélisation
│   ├── Prédiction.html     # Interface des résultats
│   ├── CSS/ & JS/          # Ressources de mise en forme et scripts
│   └── Plot/Eda/           # Visualisations interactives du site
├── README.md               # Documentation principale
```

## Méthodologie générale

### Analyse exploratoire (EDA)
- Analyses univariées et bivariées
- Étude des distributions et de l’asymétrie
- Visualisations : histogrammes, boxplots, scatterplots
- Test statistique de Mann–Whitney (statut tabagique)
- Justification de la transformation `log(1 + charges)`

### Prétraitement
- Split **Train / Test : 80 % / 20 %**
- Pipelines `scikit-learn` (anti data leakage)
- One-Hot Encoding des variables catégorielles
- Mise à l’échelle optionnelle des variables numériques
- Transformations apprises uniquement sur *train*

### Modélisation
Deux stratégies comparées :
- prédiction directe de `charges`
- prédiction de `log(1 + charges)` avec retransformation
Hyperparamètres optimisés via **GridSearchCV (CV = 5)**

### Évaluation
Métriques reportées sur *train* et *test* :
- **RMSE** (*Root Mean Squared Error*)__ Métrique principale
- **MSE** (*Mean Squared Error*)  
- **MAE** (*Mean Absolute Error*)  
- **\(R^2\)** (*coefficient de détermination*)  
- **MAPE** (*Mean Absolute Percentage Error*)

--- 

## Modèles implémentés

### Modèles Linéaires & Diagnostics
Une famille de modèles de référence a été testée (**OLS**, **Ridge**, **Lasso**, **Elastic Net**) avec un contrôle strict de la validité statistique :
* Vérification de la **normalité** et de l'**homoscédasticité** des résidus.
* Contrôle de la **multicolinéarité** via le calcul du **VIF** (Variance Inflation Factor).

### Algorithmes Non Linéaires
Pour capturer des relations complexes, nous avons exploré des approches basées sur la proximité et les structures d'arbres :
* **K-Nearest Neighbors (KNN)** et **SVR**.
* **Arbres de décision**.

### Méthodes Ensemblistes (Performances Optimales)
Ces modèles ont offert les meilleurs résultats grâce à la combinaison d'estimateurs :
* **Bagging** : Random Forest.
* **Boosting** : AdaBoost, Gradient Boosting et les variantes de pointe (**XGBoost**, **LightGBM**, **CatBoost**).

## Résultats clés
Meilleur performance globale sur CatBoost sur la cible charges

## Cloner le projet
git clone https://github.com/nncelina/ML_medical-coasts.git

## Installer les dépendances
pip install -r requirements.txt

---
## 👥 Auteurs
* **DIALLO** Cheick Oumar
* **FALL** Ndeye Ramatoulaye Ndoye
* **FOGWOUNG DJOUFACK** Sarah-Laure
* **NGUEMFOUO NGOUMTSA** Célina
* **RASAMOELINA** Nihaviana Albert Paulinah,
Élèves ingénieurs statisticiens économistes (ISE 2), ENSAE

---
*Sous la supervision de Mme Mously DIAW, Freelance Senior Data Scientist / ML Engineer*
