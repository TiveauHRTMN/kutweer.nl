/**
 * Alle Nederlandse woonplaatsen — gegroepeerd per provincie.
 * Dit bestand wordt continu uitgebreid door OpenClaw's SEO engine.
 * 
 * Elke plaats wordt een eigen pagina op /weer/[province]/[place]
 * die rankt voor "weer [plaatsnaam]" in Google.
 * 
 * DOEL: ~7.000 plaatsen → ~7.000 indexeerbare pagina's.
 */

export interface Place {
  name: string;
  province: string;
  lat: number;
  lon: number;
  population?: number;
  character?: "coastal" | "inland" | "highland" | "urban"; // Voor slimme AI-commentaar en affiliates
}

export type Province =
  | "groningen"
  | "friesland"
  | "drenthe"
  | "overijssel"
  | "flevoland"
  | "gelderland"
  | "utrecht"
  | "noord-holland"
  | "zuid-holland"
  | "zeeland"
  | "noord-brabant"
  | "limburg";

export const PROVINCE_LABELS: Record<Province, string> = {
  groningen: "Groningen",
  friesland: "Friesland",
  drenthe: "Drenthe",
  overijssel: "Overijssel",
  flevoland: "Flevoland",
  gelderland: "Gelderland",
  utrecht: "Utrecht",
  "noord-holland": "Noord-Holland",
  "zuid-holland": "Zuid-Holland",
  zeeland: "Zeeland",
  "noord-brabant": "Noord-Brabant",
  limburg: "Limburg",
};

// ============================================================
// PLAATSEN DATABASE
// OpenClaw voegt hier continu plaatsen aan toe.
// Sorteer per provincie, alfabetisch op naam.
// ============================================================

export const ALL_PLACES: Place[] = [
  // ── GRONINGEN ──
  { name: "Groningen", province: "groningen", lat: 53.2194, lon: 6.5665, population: 233000, character: "urban" },
  { name: "Delfzijl", province: "groningen", lat: 53.3333, lon: 6.9167, population: 25000, character: "coastal" },
  { name: "Appingedam", province: "groningen", lat: 53.3211, lon: 6.8553, population: 12000 },
  { name: "Hoogezand", province: "groningen", lat: 53.1614, lon: 6.7594, population: 34000 },
  { name: "Sappemeer", province: "groningen", lat: 53.1614, lon: 6.7894, population: 20000 },
  { name: "Leek", province: "groningen", lat: 53.1625, lon: 6.3750, population: 19000 },
  { name: "Stadskanaal", province: "groningen", lat: 52.9906, lon: 6.9506, population: 33000 },
  { name: "Veendam", province: "groningen", lat: 53.1069, lon: 6.8792, population: 28000 },
  { name: "Winschoten", province: "groningen", lat: 53.1442, lon: 7.0347, population: 18000 },
  { name: "Ter Apel", province: "groningen", lat: 52.8756, lon: 7.0642, population: 10000 },
  { name: "Haren", province: "groningen", lat: 53.1717, lon: 6.6100, population: 19000 },
  { name: "Zuidhorn", province: "groningen", lat: 53.2469, lon: 6.3997, population: 8000 },
  { name: "Bedum", province: "groningen", lat: 53.3000, lon: 6.6028, population: 10500 },
  { name: "Loppersum", province: "groningen", lat: 53.3319, lon: 6.7486, population: 3200 },
  { name: "Uithuizen", province: "groningen", lat: 53.4089, lon: 6.6753, population: 4600, character: "coastal" },
  { name: "Warffum", province: "groningen", lat: 53.3928, lon: 6.5619, population: 2100, character: "coastal" },
  { name: "Winsum", province: "groningen", lat: 53.3300, lon: 6.5167, population: 7500 },
  { name: "Bellingwolde", province: "groningen", lat: 53.1167, lon: 7.1667, population: 2500 },
  { name: "Siddeburen", province: "groningen", lat: 53.2458, lon: 6.8667, population: 3000 },
  { name: "Musselkanaal", province: "groningen", lat: 52.9333, lon: 7.0167, population: 7000 },

  // ── FRIESLAND ──
  { name: "Leeuwarden", province: "friesland", lat: 53.2012, lon: 5.7999, population: 124000, character: "urban" },
  { name: "Drachten", province: "friesland", lat: 53.1033, lon: 6.1003, population: 45000 },
  { name: "Heerenveen", province: "friesland", lat: 52.9581, lon: 5.9253, population: 50000 },
  { name: "Sneek", province: "friesland", lat: 53.0333, lon: 5.6614, population: 34000 },
  { name: "Harlingen", province: "friesland", lat: 53.1744, lon: 5.4236, population: 16000, character: "coastal" },
  { name: "Franeker", province: "friesland", lat: 53.1867, lon: 5.5408, population: 13000 },
  { name: "Dokkum", province: "friesland", lat: 53.3264, lon: 5.9972, population: 13000 },
  { name: "Bolsward", province: "friesland", lat: 53.0614, lon: 5.5267, population: 10000 },
  { name: "Joure", province: "friesland", lat: 52.9669, lon: 5.7944, population: 13000 },
  { name: "Wolvega", province: "friesland", lat: 52.8808, lon: 5.9942, population: 13000 },
  { name: "Lemmer", province: "friesland", lat: 52.8450, lon: 5.7103, population: 10000, character: "coastal" },
  { name: "Bakkeveen", province: "friesland", lat: 53.0711, lon: 6.2617, population: 1800 },
  { name: "Grou", province: "friesland", lat: 53.0922, lon: 5.8308, population: 5500 },
  { name: "Workum", province: "friesland", lat: 52.9808, lon: 5.4436, population: 4500, character: "coastal" },
  { name: "Kollum", province: "friesland", lat: 53.2878, lon: 6.1544, population: 3500 },
  { name: "Sint Annaparochie", province: "friesland", lat: 53.2778, lon: 5.6583, population: 4800 },
  { name: "Bergum", province: "friesland", lat: 53.1917, lon: 6.0000, population: 10000 },
  { name: "Makkum", province: "friesland", lat: 53.0556, lon: 5.4028, population: 3500, character: "coastal" },
  { name: "Stavoren", province: "friesland", lat: 52.8833, lon: 5.3583, population: 1000, character: "coastal" },
  { name: "Hindeloopen", province: "friesland", lat: 52.9431, lon: 5.4025, population: 900, character: "coastal" },

  // ── DRENTHE ──
  { name: "Assen", province: "drenthe", lat: 52.9928, lon: 6.5642, population: 68000, character: "urban" },
  { name: "Emmen", province: "drenthe", lat: 52.7858, lon: 6.8975, population: 107000, character: "urban" },
  { name: "Hoogeveen", province: "drenthe", lat: 52.7208, lon: 6.4758, population: 55000 },
  { name: "Meppel", province: "drenthe", lat: 52.6947, lon: 6.1953, population: 34000 },
  { name: "Coevorden", province: "drenthe", lat: 52.6617, lon: 6.7417, population: 35000 },
  { name: "Beilen", province: "drenthe", lat: 52.8600, lon: 6.5125, population: 11000 },
  { name: "Westerbork", province: "drenthe", lat: 52.8508, lon: 6.6111, population: 4700 },
  { name: "Gieten", province: "drenthe", lat: 53.0036, lon: 6.7661, population: 5500 },
  { name: "Roden", province: "drenthe", lat: 53.1367, lon: 6.4250, population: 15000 },
  { name: "Eelde", province: "drenthe", lat: 53.1417, lon: 6.5833, population: 7000 },
  { name: "Paterswolde", province: "drenthe", lat: 53.1556, lon: 6.5694, population: 4000 },
  { name: "Zuidlaren", province: "drenthe", lat: 53.0917, lon: 6.6833, population: 10000 },
  { name: "Borger", province: "drenthe", lat: 52.9236, lon: 6.7917, population: 5000, character: "highland" },
  { name: "Diever", province: "drenthe", lat: 52.8550, lon: 6.3167, population: 2500 },
  { name: "Dwingeloo", province: "drenthe", lat: 52.8333, lon: 6.3667, population: 4000 },

  // ── OVERIJSSEL ──
  { name: "Zwolle", province: "overijssel", lat: 52.5168, lon: 6.0830, population: 131000, character: "urban" },
  { name: "Enschede", province: "overijssel", lat: 52.2215, lon: 6.8937, population: 160000, character: "urban" },
  { name: "Deventer", province: "overijssel", lat: 52.2551, lon: 6.1639, population: 101000, character: "urban" },
  { name: "Almelo", province: "overijssel", lat: 52.3567, lon: 6.6625, population: 73000 },
  { name: "Hengelo", province: "overijssel", lat: 52.2658, lon: 6.7931, population: 81000 },
  { name: "Kampen", province: "overijssel", lat: 52.5550, lon: 5.9114, population: 54000, character: "coastal" },
  { name: "Hardenberg", province: "overijssel", lat: 52.5750, lon: 6.6167, population: 27000 },
  { name: "Raalte", province: "overijssel", lat: 52.3872, lon: 6.2756, population: 37000 },
  { name: "Oldenzaal", province: "overijssel", lat: 52.3133, lon: 6.9292, population: 32000 },
  { name: "Steenwijk", province: "overijssel", lat: 52.7875, lon: 6.1194, population: 18000 },
  { name: "Rijssen", province: "overijssel", lat: 52.3100, lon: 6.5167, population: 30000 },
  { name: "Ommen", province: "overijssel", lat: 52.5264, lon: 6.4247, population: 18000 },
  { name: "Nijverdal", province: "overijssel", lat: 52.3583, lon: 6.4639, population: 25000 },
  { name: "Wierden", province: "overijssel", lat: 52.3508, lon: 6.5917, population: 24000 },
  { name: "Goor", province: "overijssel", lat: 52.2333, lon: 6.5867, population: 12000 },

  // ── FLEVOLAND ──
  { name: "Almere", province: "flevoland", lat: 52.3508, lon: 5.2647, population: 218000 },
  { name: "Lelystad", province: "flevoland", lat: 52.5085, lon: 5.4750, population: 80000 },
  { name: "Dronten", province: "flevoland", lat: 52.5258, lon: 5.7186, population: 41000 },
  { name: "Emmeloord", province: "flevoland", lat: 52.7108, lon: 5.7483, population: 27000 },
  { name: "Urk", province: "flevoland", lat: 52.6614, lon: 5.5983, population: 21000 },
  { name: "Zeewolde", province: "flevoland", lat: 52.3311, lon: 5.5428, population: 23000 },
  { name: "Biddinghuizen", province: "flevoland", lat: 52.4417, lon: 5.7039, population: 5000 },
  { name: "Swifterbant", province: "flevoland", lat: 52.5667, lon: 5.6333, population: 7500 },

  // ── GELDERLAND ──
  { name: "Arnhem", province: "gelderland", lat: 51.9851, lon: 5.8987, population: 164000 },
  { name: "Nijmegen", province: "gelderland", lat: 51.8126, lon: 5.8372, population: 179000 },
  { name: "Apeldoorn", province: "gelderland", lat: 52.2112, lon: 5.9699, population: 165000 },
  { name: "Ede", province: "gelderland", lat: 52.0478, lon: 5.6692, population: 118000 },
  { name: "Doetinchem", province: "gelderland", lat: 51.9653, lon: 6.2886, population: 58000 },
  { name: "Tiel", province: "gelderland", lat: 51.8881, lon: 5.4319, population: 42000 },
  { name: "Harderwijk", province: "gelderland", lat: 52.3422, lon: 5.6208, population: 48000 },
  { name: "Wageningen", province: "gelderland", lat: 51.9692, lon: 5.6658, population: 39000 },
  { name: "Zutphen", province: "gelderland", lat: 52.1389, lon: 6.2044, population: 48000 },
  { name: "Barneveld", province: "gelderland", lat: 52.1403, lon: 5.5875, population: 59000 },
  { name: "Winterswijk", province: "gelderland", lat: 51.9728, lon: 6.7194, population: 29000 },
  { name: "Elburg", province: "gelderland", lat: 52.4425, lon: 5.8369, population: 23000 },
  { name: "Ermelo", province: "gelderland", lat: 52.3017, lon: 5.6208, population: 27000 },
  { name: "Culemborg", province: "gelderland", lat: 51.9550, lon: 5.2278, population: 29000 },
  { name: "Zevenaar", province: "gelderland", lat: 51.9267, lon: 6.0697, population: 32000 },
  { name: "Nijkerk", province: "gelderland", lat: 52.2208, lon: 5.4875, population: 43000 },

  { name: "Putten", province: "gelderland", lat: 52.2592, lon: 5.6078, population: 24000 },
  { name: "Lochem", province: "gelderland", lat: 52.1594, lon: 6.4111, population: 13000 },
  { name: "Groenlo", province: "gelderland", lat: 52.0436, lon: 6.6167, population: 10000 },
  { name: "Borculo", province: "gelderland", lat: 52.1153, lon: 6.5167, population: 10000 },
  { name: "Eibergen", province: "gelderland", lat: 52.1000, lon: 6.6500, population: 12000 },
  { name: "Lichtenvoorde", province: "gelderland", lat: 51.9861, lon: 6.5667, population: 13000 },
  { name: "Wijchen", province: "gelderland", lat: 51.8100, lon: 5.7208, population: 41000 },
  { name: "Druten", province: "gelderland", lat: 51.8894, lon: 5.6083, population: 19000 },
  { name: "Zaltbommel", province: "gelderland", lat: 51.8106, lon: 5.2494, population: 29000 },
  { name: "Bemmel", province: "gelderland", lat: 51.8906, lon: 5.8953, population: 12000 },
  { name: "Elst", province: "gelderland", lat: 51.9189, lon: 5.8483, population: 22000 },
  { name: "Huissen", province: "gelderland", lat: 51.9367, lon: 5.9408, population: 19000 },
  { name: "Renkum", province: "gelderland", lat: 51.9750, lon: 5.7333, population: 31000 },
  { name: "Heelsum", province: "gelderland", lat: 51.9806, lon: 5.7539, population: 3500 },
  { name: "Rheden", province: "gelderland", lat: 52.0000, lon: 6.0333, population: 43000 },
  { name: "Velp", province: "gelderland", lat: 51.9931, lon: 5.9750, population: 18000 },
  { name: "Dieren", province: "gelderland", lat: 52.0442, lon: 6.1000, population: 14000 },

  // ── UTRECHT ──
  { name: "Utrecht", province: "utrecht", lat: 52.0907, lon: 5.1214, population: 361000, character: "urban" },
  { name: "Amersfoort", province: "utrecht", lat: 52.1561, lon: 5.3878, population: 157000, character: "urban" },
  { name: "Veenendaal", province: "utrecht", lat: 52.0275, lon: 5.5583, population: 68000 },
  { name: "Nieuwegein", province: "utrecht", lat: 52.0286, lon: 5.0811, population: 64000, character: "urban" },
  { name: "Zeist", province: "utrecht", lat: 52.0894, lon: 5.2328, population: 65000 },
  { name: "Woerden", province: "utrecht", lat: 52.0853, lon: 4.8842, population: 53000 },
  { name: "IJsselstein", province: "utrecht", lat: 52.0233, lon: 5.0447, population: 34000 },
  { name: "Houten", province: "utrecht", lat: 52.0286, lon: 5.1711, population: 50000, character: "urban" },
  { name: "Soest", province: "utrecht", lat: 52.1742, lon: 5.2917, population: 47000 },
  { name: "Bunschoten", province: "utrecht", lat: 52.2439, lon: 5.3736, population: 21000, character: "coastal" },
  { name: "Spakenburg", province: "utrecht", lat: 52.2539, lon: 5.3736, population: 21000, character: "coastal" },
  { name: "De Bilt", province: "utrecht", lat: 52.1108, lon: 5.1783, population: 43000 },
  { name: "Bilthoven", province: "utrecht", lat: 52.1275, lon: 5.2008, population: 23000 },
  { name: "Baarn", province: "utrecht", lat: 52.2117, lon: 5.2875, population: 25000 },
  { name: "Driebergen", province: "utrecht", lat: 52.0536, lon: 5.2806, population: 18000 },
  { name: "Rhenen", province: "utrecht", lat: 51.9592, lon: 5.5686, population: 20000 },
  { name: "Leusden", province: "utrecht", lat: 52.1325, lon: 5.4333, population: 30000 },
  { name: "Wijk bij Duurstede", province: "utrecht", lat: 51.9750, lon: 5.3333, population: 23000 },
  { name: "Lopik", province: "utrecht", lat: 51.9717, lon: 4.9458, population: 14000 },
  { name: "Montfoort", province: "utrecht", lat: 52.0450, lon: 4.9514, population: 13000 },

  // ── NOORD-HOLLAND ──
  { name: "Amsterdam", province: "noord-holland", lat: 52.3676, lon: 4.9041, population: 907000 },
  { name: "Haarlem", province: "noord-holland", lat: 52.3874, lon: 4.6462, population: 162000 },
  { name: "Zaandam", province: "noord-holland", lat: 52.4389, lon: 4.8264, population: 77000 },
  { name: "Hilversum", province: "noord-holland", lat: 52.2292, lon: 5.1764, population: 92000 },
  { name: "Alkmaar", province: "noord-holland", lat: 52.6324, lon: 4.7534, population: 110000 },
  { name: "Hoorn", province: "noord-holland", lat: 52.6425, lon: 5.0594, population: 73000 },
  { name: "Den Helder", province: "noord-holland", lat: 52.9535, lon: 4.7570, population: 56000 },
  { name: "Purmerend", province: "noord-holland", lat: 52.5050, lon: 4.9597, population: 81000 },
  { name: "Heerhugowaard", province: "noord-holland", lat: 52.6650, lon: 4.8350, population: 57000 },
  { name: "Enkhuizen", province: "noord-holland", lat: 52.7033, lon: 5.2944, population: 19000 },
  { name: "Schagen", province: "noord-holland", lat: 52.7883, lon: 4.7986, population: 19000 },
  { name: "Beverwijk", province: "noord-holland", lat: 52.4833, lon: 4.6578, population: 41000 },
  { name: "Castricum", province: "noord-holland", lat: 52.5500, lon: 4.6708, population: 36000 },
  { name: "Heemskerk", province: "noord-holland", lat: 52.5089, lon: 4.6681, population: 39000 },
  { name: "Volendam", province: "noord-holland", lat: 52.4953, lon: 5.0706, population: 22000 },
  { name: "Weesp", province: "noord-holland", lat: 52.3078, lon: 5.0419, population: 19000 },
  { name: "Uitgeest", province: "noord-holland", lat: 52.5278, lon: 4.7089, population: 13000 },
  { name: "Medemblik", province: "noord-holland", lat: 52.7708, lon: 5.1083, population: 9000 },
  { name: "Texel", province: "noord-holland", lat: 53.0606, lon: 4.7994, population: 14000 },
  { name: "Amstelveen", province: "noord-holland", lat: 52.3031, lon: 4.8569, population: 92000 },
  { name: "Hoofddorp", province: "noord-holland", lat: 52.3031, lon: 4.6917, population: 77000 },
  { name: "Nieuw-Vennep", province: "noord-holland", lat: 52.2619, lon: 4.6292, population: 31000 },
  { name: "Aalsmeer", province: "noord-holland", lat: 52.2644, lon: 4.7519, population: 32000 },
  { name: "Uithoorn", province: "noord-holland", lat: 52.2431, lon: 4.8267, population: 30000 },
  { name: "Krommenie", province: "noord-holland", lat: 52.4994, lon: 4.7619, population: 17000 },
  { name: "Assendelft", province: "noord-holland", lat: 52.4764, lon: 4.7500, population: 24000 },
  { name: "Wormerveer", province: "noord-holland", lat: 52.4914, lon: 4.8000, population: 11000 },
  { name: "Koog aan de Zaan", province: "noord-holland", lat: 52.4597, lon: 4.8111, population: 11000 },
  { name: "Zaandijk", province: "noord-holland", lat: 52.4736, lon: 4.8111, population: 9000 },
  { name: "Wormer", province: "noord-holland", lat: 52.5000, lon: 4.8167, population: 13000 },
  { name: "Oostzaan", province: "noord-holland", lat: 52.4417, lon: 4.8725, population: 10000 },
  { name: "Monnickendam", province: "noord-holland", lat: 52.4583, lon: 5.0333, population: 10000 },
  { name: "Edam", province: "noord-holland", lat: 52.5125, lon: 5.0500, population: 7000 },
  { name: "Brock in Waterland", province: "noord-holland", lat: 52.4333, lon: 5.0000, population: 2500 },
  { name: "Marken", province: "noord-holland", lat: 52.4583, lon: 5.1000, population: 1800 },
  { name: "Huizen", province: "noord-holland", lat: 52.3000, lon: 5.2333, population: 41000 },
  { name: "Bussum", province: "noord-holland", lat: 52.2736, lon: 5.1611, population: 33000 },
  { name: "Naarden", province: "noord-holland", lat: 52.2958, lon: 5.1611, population: 17000 },
  { name: "Laren", province: "noord-holland", lat: 52.2583, lon: 5.2250, population: 11000 },
  { name: "Blaricum", province: "noord-holland", lat: 52.2725, lon: 5.2500, population: 12000 },
  { name: "Eemnes", province: "noord-holland", lat: 52.2542, lon: 5.2561, population: 9000 },

  // ── ZUID-HOLLAND ──
  { name: "Rotterdam", province: "zuid-holland", lat: 51.9244, lon: 4.4777, population: 656000 },
  { name: "Den Haag", province: "zuid-holland", lat: 52.0705, lon: 4.3007, population: 548000 },
  { name: "Leiden", province: "zuid-holland", lat: 52.1583, lon: 4.4931, population: 125000 },
  { name: "Dordrecht", province: "zuid-holland", lat: 51.8133, lon: 4.6736, population: 119000 },
  { name: "Zoetermeer", province: "zuid-holland", lat: 52.0575, lon: 4.4931, population: 127000 },
  { name: "Delft", province: "zuid-holland", lat: 52.0116, lon: 4.3571, population: 104000 },
  { name: "Gouda", province: "zuid-holland", lat: 52.0115, lon: 4.7106, population: 74000 },
  { name: "Alphen aan den Rijn", province: "zuid-holland", lat: 52.1294, lon: 4.6575, population: 112000 },
  { name: "Vlaardingen", province: "zuid-holland", lat: 51.9125, lon: 4.3419, population: 74000 },
  { name: "Schiedam", province: "zuid-holland", lat: 51.9197, lon: 4.3989, population: 79000 },
  { name: "Spijkenisse", province: "zuid-holland", lat: 51.8417, lon: 4.3289, population: 59000 },
  { name: "Katwijk", province: "zuid-holland", lat: 52.1997, lon: 4.4175, population: 66000 },
  { name: "Noordwijk", province: "zuid-holland", lat: 52.2353, lon: 4.4431, population: 43000 },
  { name: "Lisse", province: "zuid-holland", lat: 52.2583, lon: 4.5561, population: 23000 },
  { name: "Sassenheim", province: "zuid-holland", lat: 52.2242, lon: 4.5222, population: 15000 },
  { name: "Gorinchem", province: "zuid-holland", lat: 51.8350, lon: 4.9736, population: 37000 },
  { name: "Ridderkerk", province: "zuid-holland", lat: 51.8667, lon: 4.6008, population: 47000 },
  { name: "Hellevoetsluis", province: "zuid-holland", lat: 51.8333, lon: 4.1333, population: 40000 },
  { name: "Barendrecht", province: "zuid-holland", lat: 51.8592, lon: 4.5367, population: 49000 },
  { name: "Zwijndrecht", province: "zuid-holland", lat: 51.8153, lon: 4.6300, population: 45000 },
  { name: "Papendrecht", province: "zuid-holland", lat: 51.8339, lon: 4.6853, population: 32000 },
  { name: "Hendrik-Ido-Ambacht", province: "zuid-holland", lat: 51.8447, lon: 4.6436, population: 31000 },
  { name: "Sliedrecht", province: "zuid-holland", lat: 51.8222, lon: 4.7761, population: 25000 },
  { name: "Pijnacker", province: "zuid-holland", lat: 52.0167, lon: 4.4333, population: 25000 },
  { name: "Nootdorp", province: "zuid-holland", lat: 52.0436, lon: 4.3944, population: 19000 },
  { name: "Leidschendam", province: "zuid-holland", lat: 52.0833, lon: 4.4000, population: 35000 },
  { name: "Voorburg", province: "zuid-holland", lat: 52.0736, lon: 4.3556, population: 40000 },
  { name: "Wassenaar", province: "zuid-holland", lat: 52.1458, lon: 4.4008, population: 26000 },
  { name: "Voorschoten", province: "zuid-holland", lat: 52.1278, lon: 4.4481, population: 25000 },
  { name: "Warmond", province: "zuid-holland", lat: 52.1931, lon: 4.5025, population: 5000 },
  { name: "Oegstgeest", province: "zuid-holland", lat: 52.1819, lon: 4.4692, population: 25000 },
  { name: "Hillegom", province: "zuid-holland", lat: 52.2903, lon: 4.5822, population: 22000 },
  { name: "Bodegraven", province: "zuid-holland", lat: 52.0842, lon: 4.7508, population: 20000 },
  { name: "Reeuwijk", province: "zuid-holland", lat: 52.0467, lon: 4.7208, population: 13000 },
  { name: "Waddinxveen", province: "zuid-holland", lat: 52.0450, lon: 4.6542, population: 30000 },
  { name: "Boskoop", province: "zuid-holland", lat: 52.0736, lon: 4.6583, population: 15000 },
  { name: "Krimpen aan den IJssel", province: "zuid-holland", lat: 51.9167, lon: 4.6000, population: 29000 },
  { name: "Capelle aan den IJssel", province: "zuid-holland", lat: 51.9289, lon: 4.5786, population: 67000 },
  { name: "Nieuwerkerk aan den IJssel", province: "zuid-holland", lat: 51.9667, lon: 4.6167, population: 22000 },
  { name: "Moordrecht", province: "zuid-holland", lat: 51.9861, lon: 4.6667, population: 8500 },
  { name: "Zuidplas", province: "zuid-holland", lat: 51.9833, lon: 4.6333, population: 45000 },

  // ── ZEELAND ──
  { name: "Middelburg", province: "zeeland", lat: 51.4989, lon: 3.6136, population: 49000, character: "urban" },
  { name: "Vlissingen", province: "zeeland", lat: 51.4422, lon: 3.5961, population: 45000, character: "coastal" },
  { name: "Goes", province: "zeeland", lat: 51.5044, lon: 3.8894, population: 38000, character: "urban" },
  { name: "Terneuzen", province: "zeeland", lat: 51.3364, lon: 3.8278, population: 25000, character: "coastal" },
  { name: "Hulst", province: "zeeland", lat: 51.2792, lon: 4.0528, population: 11000 },
  { name: "Zierikzee", province: "zeeland", lat: 51.6500, lon: 3.9167, population: 12000, character: "coastal" },
  { name: "Domburg", province: "zeeland", lat: 51.5639, lon: 3.4992, population: 1500, character: "coastal" },
  { name: "Renesse", province: "zeeland", lat: 51.7308, lon: 3.7722, population: 1800, character: "coastal" },
  { name: "Breskens", province: "zeeland", lat: 51.3975, lon: 3.5564, population: 4500, character: "coastal" },
  { name: "Yerseke", province: "zeeland", lat: 51.4911, lon: 4.0500, population: 7000, character: "coastal" },
  { name: "Veere", province: "zeeland", lat: 51.5500, lon: 3.6622, population: 22000, character: "coastal" },
  { name: "Cadzand", province: "zeeland", lat: 51.3736, lon: 3.4119, population: 800, character: "coastal" },
  { name: "Ouddorp", province: "zeeland", lat: 51.8111, lon: 3.9353, population: 6000, character: "coastal" },
  { name: "Arnemuiden", province: "zeeland", lat: 51.5000, lon: 3.6744, population: 5000 },
  { name: "Axel", province: "zeeland", lat: 51.2658, lon: 3.9089, population: 8000 },
  { name: "Oostburg", province: "zeeland", lat: 51.3267, lon: 3.4883, population: 5000 },
  { name: "Kortgene", province: "zeeland", lat: 51.5558, lon: 3.8019, population: 2000, character: "coastal" },
  { name: "Tholen", province: "zeeland", lat: 51.5333, lon: 4.1000, population: 8000, character: "coastal" },
  { name: "Oost-Souburg", province: "zeeland", lat: 51.4644, lon: 3.6061, population: 10000 },
  { name: "Bruinisse", province: "zeeland", lat: 51.6617, lon: 4.0931, population: 4000, character: "coastal" },

  // ── NOORD-BRABANT ──
  { name: "Eindhoven", province: "noord-brabant", lat: 51.4416, lon: 5.4697, population: 238000 },
  { name: "Tilburg", province: "noord-brabant", lat: 51.5555, lon: 5.0913, population: 224000 },
  { name: "Breda", province: "noord-brabant", lat: 51.5719, lon: 4.7683, population: 185000 },
  { name: "'s-Hertogenbosch", province: "noord-brabant", lat: 51.6978, lon: 5.3037, population: 157000 },
  { name: "Helmond", province: "noord-brabant", lat: 51.4783, lon: 5.6611, population: 92000 },
  { name: "Oss", province: "noord-brabant", lat: 51.7650, lon: 5.5181, population: 92000 },
  { name: "Roosendaal", province: "noord-brabant", lat: 51.5308, lon: 4.4564, population: 77000 },
  { name: "Bergen op Zoom", province: "noord-brabant", lat: 51.4950, lon: 4.2919, population: 68000 },
  { name: "Waalwijk", province: "noord-brabant", lat: 51.6833, lon: 5.0667, population: 48000 },
  { name: "Veghel", province: "noord-brabant", lat: 51.6167, lon: 5.5500, population: 28000 },
  { name: "Boxtel", province: "noord-brabant", lat: 51.5903, lon: 5.3269, population: 31000 },
  { name: "Valkenswaard", province: "noord-brabant", lat: 51.3503, lon: 5.4608, population: 31000 },
  { name: "Best", province: "noord-brabant", lat: 51.5106, lon: 5.3914, population: 30000 },
  { name: "Uden", province: "noord-brabant", lat: 51.6597, lon: 5.6158, population: 42000 },
  { name: "Dongen", province: "noord-brabant", lat: 51.6264, lon: 4.9389, population: 26000 },
  { name: "Etten-Leur", province: "noord-brabant", lat: 51.5708, lon: 4.6358, population: 44000 },
  { name: "Oosterhout", province: "noord-brabant", lat: 51.6444, lon: 4.8622, population: 56000 },
  { name: "Schijndel", province: "noord-brabant", lat: 51.6194, lon: 5.4347, population: 23000 },
  { name: "Sint-Michielsgestel", province: "noord-brabant", lat: 51.6375, lon: 5.3533, population: 29000 },
  { name: "Geldrop", province: "noord-brabant", lat: 51.4239, lon: 5.5558, population: 28000 },
  { name: "Mierlo", province: "noord-brabant", lat: 51.4428, lon: 5.6144, population: 10000 },
  { name: "Veldhoven", province: "noord-brabant", lat: 51.4194, lon: 5.4022, population: 45000 },
  { name: "Oisterwijk", province: "noord-brabant", lat: 51.5808, lon: 5.1953, population: 26000 },
  { name: "Boxmeer", province: "noord-brabant", lat: 51.6483, lon: 5.9458, population: 12000 },
  { name: "Cuijk", province: "noord-brabant", lat: 51.7289, lon: 5.8794, population: 18000 },
  { name: "Zundert", province: "noord-brabant", lat: 51.4697, lon: 4.6617, population: 21000 },
  { name: "Moerdijk", province: "noord-brabant", lat: 51.6917, lon: 4.6194, population: 37000 },
  { name: "Zevenbergen", province: "noord-brabant", lat: 51.6458, lon: 4.6083, population: 14000 },
  { name: "Drunen", province: "noord-brabant", lat: 51.6853, lon: 5.1328, population: 18000 },
  { name: "Kaatsheuvel", province: "noord-brabant", lat: 51.6567, lon: 5.0389, population: 16000 },
  { name: "Loon op Zand", province: "noord-brabant", lat: 51.6267, lon: 5.0750, population: 23000 },
  { name: "Gilze", province: "noord-brabant", lat: 51.5450, lon: 4.9419, population: 8000 },
  { name: "Rijen", province: "noord-brabant", lat: 51.5886, lon: 4.9194, population: 16000 },
  { name: "Son en Breugel", province: "noord-brabant", lat: 51.5111, lon: 5.4853, population: 17000 },
  { name: "Nuenen", province: "noord-brabant", lat: 51.4744, lon: 5.5508, population: 23000 },

  // ── LIMBURG ──
  { name: "Maastricht", province: "limburg", lat: 50.8514, lon: 5.6910, population: 122000 },
  { name: "Venlo", province: "limburg", lat: 51.3700, lon: 6.1681, population: 102000 },
  { name: "Heerlen", province: "limburg", lat: 50.8882, lon: 5.9815, population: 87000 },
  { name: "Sittard", province: "limburg", lat: 51.0000, lon: 5.8681, population: 48000 },
  { name: "Roermond", province: "limburg", lat: 51.1942, lon: 5.9861, population: 58000 },
  { name: "Weert", province: "limburg", lat: 51.2517, lon: 5.7069, population: 50000 },
  { name: "Kerkrade", province: "limburg", lat: 50.8656, lon: 6.0653, population: 46000 },
  { name: "Geleen", province: "limburg", lat: 50.9739, lon: 5.8306, population: 33000 },
  { name: "Brunssum", province: "limburg", lat: 50.9458, lon: 5.9708, population: 28000 },
  { name: "Valkenburg", province: "limburg", lat: 50.8653, lon: 5.8317, population: 17000 },
  { name: "Vaals", province: "limburg", lat: 50.7700, lon: 6.0183, population: 10000 },
  { name: "Gulpen", province: "limburg", lat: 50.8167, lon: 5.8875, population: 7500 },
  { name: "Thorn", province: "limburg", lat: 51.1597, lon: 5.8358, population: 2800 },
  { name: "Meerssen", province: "limburg", lat: 50.8886, lon: 5.7500, population: 19000 },
  { name: "Landgraaf", province: "limburg", lat: 50.9083, lon: 6.0333, population: 37000 },
];

// ============================================================
// Helper functies
// ============================================================

/** Totaal aantal plaatsen in de database */
export const PLACES_COUNT = ALL_PLACES.length;

/** Alle provincies met hun plaatsen */
export function placesByProvince(): Record<string, Place[]> {
  const result: Record<string, Place[]> = {};
  for (const place of ALL_PLACES) {
    if (!result[place.province]) result[place.province] = [];
    result[place.province].push(place);
  }
  return result;
}

/** Zoek een plaats op slug */
export function findPlace(provinceSlug: string, placeSlug: string): Place | undefined {
  return ALL_PLACES.find(
    (p) =>
      p.province === provinceSlug &&
      p.name.toLowerCase().replace(/['\s]+/g, "-") === placeSlug
  );
}

/** Maak een URL-slug van een plaatsnaam */
export function placeSlug(name: string): string {
  return name.toLowerCase().replace(/['\s]+/g, "-");
}

/** Vind de 5 dichtstbijzijnde plaatsen */
export function nearbyPlaces(place: Place, count = 5): Place[] {
  return ALL_PLACES
    .filter((p) => p.name !== place.name)
    .map((p) => ({
      ...p,
      dist: Math.sqrt(Math.pow(p.lat - place.lat, 2) + Math.pow(p.lon - place.lon, 2)),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count);
}
