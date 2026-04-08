# Canadian Tribunal Database Codes
**Complete reference for CanLII API database abbreviations**

## 🏛️ Workers' Compensation Tribunals

| Province | Database Code | Full Name | Est. Cases/Year |
|----------|---------------|-----------|-----------------|
| **Ontario** | `onwsiat` | Workplace Safety & Insurance Appeals Tribunal | 600-700 |
| **British Columbia** | `bcwcat` | Workers' Compensation Appeal Tribunal | 400-600 |
| **Quebec** | `qctat` | Tribunal administratif du travail | 300-500 |
| **Alberta** | `abwcac` | Workers' Compensation Appeals Commission | 250-400 |
| **Saskatchewan** | `skwcab` | Workers' Compensation Appeal Board | 100-200 |
| **Manitoba** | `mbwcat` | Workers Compensation Appeal Tribunal | 100-150 |
| **Nova Scotia** | `nswcat` | Workers' Compensation Appeals Tribunal | 80-120 |
| **New Brunswick** | `nbwcat` | Workers' Compensation Appeals Tribunal | 60-100 |
| **Newfoundland** | `nlwcat` | Workplace Health Safety & Compensation Review Division | 40-80 |
| **PEI** | `pewcat` | Workers Compensation Appeal Tribunal | 20-40 |

---

## ⚖️ Human Rights Tribunals

| Province | Database Code | Full Name | Est. Cases/Year |
|----------|---------------|-----------|-----------------|
| **Ontario** | `onhrt` | Human Rights Tribunal of Ontario | 200-300 |
| **British Columbia** | `bchrt` | BC Human Rights Tribunal | 150-250 |
| **Quebec** | `qccdp` | Commission des droits de la personne et des droits de la jeunesse | 100-200 |
| **Alberta** | N/A | (No dedicated tribunal - uses Alberta Court of King's Bench) | N/A |
| **Saskatchewan** | `skhrc` | Saskatchewan Human Rights Commission | 50-100 |
| **Manitoba** | `mbhrc` | Manitoba Human Rights Commission | 40-80 |
| **Nova Scotia** | `nshrc` | Nova Scotia Human Rights Commission | 30-60 |
| **New Brunswick** | `nbhrc` | New Brunswick Human Rights Commission | 20-40 |

**Note:** Many provinces route human rights cases through provincial courts rather than dedicated tribunals.

---

## 🏛️ Provincial Courts of Appeal

| Province | Database Code | Full Name | Worker-Related Cases/Year |
|----------|---------------|-----------|---------------------------|
| **Ontario** | `onca` | Ontario Court of Appeal | 80-120 |
| **British Columbia** | `bcca` | BC Court of Appeal | 60-100 |
| **Quebec** | `qcca` | Quebec Court of Appeal | 50-90 |
| **Alberta** | `abca` | Alberta Court of Appeal | 40-70 |
| **Saskatchewan** | `skca` | Saskatchewan Court of Appeal | 20-40 |
| **Manitoba** | `mbca` | Manitoba Court of Appeal | 20-40 |
| **Nova Scotia** | `nsca` | Nova Scotia Court of Appeal | 15-30 |
| **New Brunswick** | `nbca` | New Brunswick Court of Appeal | 10-25 |
| **Newfoundland** | `nlca` | Newfoundland & Labrador Court of Appeal | 10-20 |
| **PEI** | `peca` | PEI Court of Appeal | 5-15 |

---

## 🇨🇦 Federal Courts

| Court | Database Code | Full Name | Worker-Related Cases/Year |
|-------|---------------|-----------|---------------------------|
| **Supreme Court** | `scc` | Supreme Court of Canada | 10-20 |
| **Federal Court** | `fc` | Federal Court of Canada | 30-60 |
| **Federal Court of Appeal** | `fca` | Federal Court of Appeal | 20-40 |

---

## 🏥 Specialized Tribunals

| Province | Database Code | Full Name | Focus Area |
|----------|---------------|-----------|------------|
| **Ontario** | `oncfsrb` | Criminal Injuries Compensation Board | Crime-related injuries |
| **Ontario** | `oncat` | Condominium Authority Tribunal | Accessibility disputes |
| **BC** | `bcigsrc` | BC Income and Disability Assistance Appeal Tribunal | Disability benefits |
| **Quebec** | `qctdp` | Tribunal des droits de la personne | Discrimination |

---

## 📋 **Usage Examples**

### Direct Enumeration (Workers' Comp)
```powershell
# Ontario WSIAT
node scripts/scrape-direct.js --database=onwsiat --years=2024,2025,2026

# BC WCAT
node scripts/scrape-direct.js --database=bcwcat --years=2024,2025,2026

# Quebec TAT
node scripts/scrape-direct.js --database=qctat --years=2024,2025,2026
```

### Targeted Search (Human Rights)
```powershell
# Ontario Human Rights Tribunal
node scripts/scrape-canlii-tribunals-v5-enhanced.js \
  --database=onhrt \
  --search="injured worker + accommodation"

# BC Human Rights Tribunal
node scripts/scrape-canlii-tribunals-v5-enhanced.js \
  --database=bchrt \
  --search="persons with disabilities + workplace"
```

### Court of Appeal (Precedent Cases)
```powershell
# Ontario Court of Appeal
node scripts/scrape-canlii-tribunals-v5-enhanced.js \
  --database=onca \
  --search="WSIB + judicial review" \
  --changedSince=2020-01-01
```

---

## 🎯 **Priority Collection Order**

Based on volume + relevance to Thunder Bay pilot:

### Week 1: Ontario Workers' Comp
1. `onwsiat` (2024-2026): **1,800 cases**
2. `onwsiat` (2021-2023): **2,100 cases**
3. `onwsiat` (2018-2020): **2,100 cases**

**Method:** Direct enumeration  
**Total:** ~6,000 Ontario decisions

---

### Week 2: National Workers' Comp
4. `bcwcat` (2020-2026): **2,800 cases**
5. `qctat` (2020-2026): **2,100 cases**
6. `abwcac` (2020-2026): **1,400 cases**
7. `skwcab` + `mbwcat` + `nswcat` (2020-2026): **1,200 cases**

**Method:** Direct enumeration  
**Total:** ~7,500 national decisions

---

### Week 3: Human Rights + Appeals
8. `onhrt` (2020-2026): **1,000 cases**
9. `bchrt` (2020-2026): **800 cases**
10. `onca` + `bcca` + `qcca` (2020-2026): **600 cases**

**Method:** Targeted search  
**Total:** ~2,400 tribunal/court decisions

---

### Week 4: Historical Backfill
11. `onwsiat` (2010-2017): **5,000 cases**
12. `bcwcat` (2010-2019): **3,500 cases**

**Method:** Year-by-year direct enumeration  
**Total:** ~8,500 precedent cases

---

## 🔍 **Database Code Verification**

If a database code doesn't work, check CanLII's database list:

```javascript
// Test if database exists
const testUrl = `https://api.canlii.org/v1/caseBrowse/en/${databaseCode}?api_key=${API_KEY}`;

// Common issues:
// ❌ "onwsib" → Incorrect (should be "onwsiat")
// ❌ "bcwcb" → Incorrect (should be "bcwcat")  
// ❌ "qcwcat" → Incorrect (should be "qctat")
```

**Official database list:** https://api.canlii.org/v1/caseBrowse/en/?api_key=YOUR_KEY

---

## 📊 **Total Collection Potential**

| Category | Databases | Est. Cases (2020-2026) | Est. Cases (2010-2026) |
|----------|-----------|------------------------|------------------------|
| **Workers' Comp** | 10 databases | **11,000** | **24,000** |
| **Human Rights** | 7 databases | **2,200** | **4,800** |
| **Courts of Appeal** | 11 databases | **1,500** | **3,500** |
| **Federal Courts** | 3 databases | **600** | **1,400** |
| **TOTAL** | **31 databases** | **15,300** | **33,700** |

---

## 🚀 **Quick Start Commands**

### Tonight (Ontario Recent)
```powershell
node scripts/collect-tonight.js
```
**Collects:** onwsiat 2024-2026 (~1,800 cases)

### Full Ontario (3 days)
```powershell
node scripts/scrape-direct.js --database=onwsiat --years=2024,2025,2026
node scripts/scrape-direct.js --database=onwsiat --years=2021,2022,2023
node scripts/scrape-direct.js --database=onwsiat --years=2018,2019,2020
```
**Collects:** All Ontario 2018-2026 (~6,000 cases)

### Canada-Wide Recent (7 days)
```powershell
# See CANLII-COLLECTION-GUIDE.md for full 7-day schedule
```
**Collects:** All provinces 2020-2026 (~15,000 cases)

---

**Questions about specific tribunals or databases?** Check the CanLII API documentation or test a single year first:

```powershell
node scripts/scrape-direct.js --database=NEW_CODE --years=2026
```
