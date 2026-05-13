import type { EquipmentType, FleetSizeCategory, InferredTruckType } from "@/types/carrier";
import { toNormalizedLower } from "@/utils/normalization";

export type CarrierClassificationInput = {
  cargoCarried?: string;
  operationClassification?: string;
  carrierOperation?: string;
  legalName?: string;
  dbaName?: string;
  powerUnits?: string;
  drivers?: string;
};

function toInteger(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function classifyFleetSize(powerUnits?: string, drivers?: string): FleetSizeCategory {
  const pu = toInteger(powerUnits);
  const dr = toInteger(drivers);
  const sizeScore = Math.max(pu, dr);

  if (sizeScore <= 1) return "Owner Operator";
  if (sizeScore <= 10) return "Small Fleet";
  if (sizeScore <= 100) return "Medium Fleet";
  return "Enterprise Fleet";
}

function inferTruckType(input: CarrierClassificationInput, fleetSizeCategory: FleetSizeCategory) {
  const classifierText = [
    toNormalizedLower(input.cargoCarried),
    toNormalizedLower(input.operationClassification),
    toNormalizedLower(input.carrierOperation),
    toNormalizedLower(input.legalName),
    toNormalizedLower(input.dbaName),
  ]
    .filter(Boolean)
    .join(" ");

  if (
    containsAny(classifierText, ["hazmat", "hazardous", "explosive", "toxic", "radioactive", "flammable"])
  ) {
    return "Hazmat";
  }
  if (containsAny(classifierText, ["refrigerated", "reefer", "temperature", "frozen"])) {
    return "Reefer";
  }
  if (containsAny(classifierText, ["lumber", "steel", "building materials", "construction", "flatbed"])) {
    return "Flatbed";
  }
  if (containsAny(classifierText, ["auto transport", "car hauler", "vehicle transport"])) {
    return "Car Hauler";
  }
  if (containsAny(classifierText, ["oil", "chemical", "liquid bulk", "petroleum", "tanker"])) {
    return "Tanker";
  }
  if (containsAny(classifierText, ["power only", "power-only", "trailer interchange"])) {
    return "Power Only";
  }
  if (containsAny(classifierText, ["box truck", "parcel", "courier", "local delivery"])) {
    return "Box Truck";
  }
  if (
    fleetSizeCategory !== "Enterprise Fleet" &&
    containsAny(classifierText, ["pickup", "hotshot", "sprinter", "gooseneck", "non-cdl"])
  ) {
    return "Hotshot";
  }
  if (containsAny(classifierText, ["general freight", "dry goods", "van"])) {
    return "Dry Van";
  }

  return undefined;
}

export function classifyCarrier(input: CarrierClassificationInput): {
  fleetSizeCategory: FleetSizeCategory;
  inferredTruckType?: InferredTruckType;
  equipmentType?: EquipmentType;
} {
  const fleetSizeCategory = classifyFleetSize(input.powerUnits, input.drivers);
  const inferredTruckType = inferTruckType(input, fleetSizeCategory);

  return {
    fleetSizeCategory,
    inferredTruckType,
    equipmentType: inferredTruckType,
  };
}
