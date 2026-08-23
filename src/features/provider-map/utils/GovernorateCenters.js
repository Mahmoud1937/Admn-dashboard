
import egyptGovernorates from "./Egyptgovernorates.json";

const CAPITAL_COORDS = {
  "EG-QH": [30.0444, 31.2357],   // Cairo — verified correct
  "EG-JZ": [30.0131, 31.2089],   // Giza — verified correct
  "EG-IK": [31.2001, 29.9187],   // Alexandria — verified correct
  "EG-QL": [30.4608, 31.1875],   // Qalyubia (Banha) — FIXED, was [30.3085, 31.2653]
  "EG-KS": [31.1107, 30.9879],   // Kafr el-Sheikh — ⚠️ NEEDS VERIFICATION
  "EG-DQ": [31.0403, 31.3828],   // Dakahlia (Mansoura) — FIXED, was [31.3880, 31.0309] (lat/lng were swapped)
  "EG-DT": [31.4175, 31.4487],   // Damietta — ⚠️ NEEDS VERIFICATION
  "EG-SQ": [30.5877, 31.5020],   // Sharqia (Zagazig) — FIXED, was [31.0500, 30.6000]
  "EG-GH": [30.7830, 31.0000],   // Gharbia (Tanta) — FIXED, was [31.0409, 30.7865] (lat/lng were swapped)
  "EG-MF": [30.5573, 31.0118],   // Monufia (Shibin el-Kom) — verified close/correct
  "EG-BH": [30.8576, 30.5145],   // Beheira (Damanhur) — ⚠️ NEEDS VERIFICATION
  "EG-BN": [29.9737, 31.1203],   // Beni Suef — ⚠️ NEEDS VERIFICATION
  "EG-FY": [29.3100, 30.8418],   // Faiyum — verified close/correct
  "EG-MN": [28.1099, 30.7503],   // Minya — verified correct
  "EG-AT": [27.1783, 31.1859],   // Asyut — verified close/correct
  "EG-SJ": [26.5560, 31.6949],   // Sohag — verified correct
  "EG-QN": [26.1551, 32.7269],   // Qena — verified close/correct
  "EG-UQ": [25.6872, 32.6396],   // Luxor — verified correct
  "EG-AN": [24.0889, 32.8998],   // Aswan — verified correct
  "EG-WJ": [25.4390, 30.0200],   // New Valley (Al Kharga) — ⚠️ NEEDS VERIFICATION
  "EG-SW": [29.9668, 32.5498],   // Suez — verified correct
  "EG-IS": [30.5965, 32.2715],   // Ismailia — verified correct
  "EG-BS": [31.2653, 32.3019],   // Port Said — verified correct
  "EG-JS": [28.2417, 33.6222],   // South Sinai (El Tor) — FIXED, was [29.9697, 33.4068] (~190km off!)
  "EG-SS": [31.1321, 33.8033],   // North Sinai (El Arish) — FIXED, was [30.4210, 33.7240] (~78km off)
  "EG-BA": [27.1787, 33.8320],   // Red Sea (Hurghada) — ⚠️ NEEDS VERIFICATION
  "EG-MT": [31.3500, 27.2450],   // Matrouh — verified close/correct
};

function stripGovernoratePrefix(name) {
  if (!name) return name;
  return name.replace(/^محافظة\s+/, "").replace(/^محافظه\s+/, "").trim();
}

const ALL_GOVERNORATE_CENTERS = egyptGovernorates.features.map((f) => {
  const coords = CAPITAL_COORDS[f.properties.isoCode];
  return {
    id: f.properties.isoCode,
    isoCode: f.properties.isoCode,
    nameAr: stripGovernoratePrefix(f.properties.nameAr),
    nameEn: f.properties.nameEn,
    centerLat: coords ? coords[0] : null,
    centerLng: coords ? coords[1] : null,
  };
});

export function getAllGovernorateCenters() {
  return ALL_GOVERNORATE_CENTERS;
}