"use server"

// Safety data type definitions
export interface DisasterSafetyData {
  beforeDisaster: SafetySection
  duringDisaster: SafetySection
  afterDisaster: SafetySection
  firstAid: SafetySection
  emergencyContacts: EmergencyContact[]
  essentialSupplies: string[]
}

export interface SafetySection {
  title: string
  tips: string[]
}

export interface EmergencyContact {
  name: string
  number: string
  type: "emergency" | "medical" | "fire" | "police" | "other"
}

// Fallback safety data for different disaster types
const fallbackSafetyData: Record<string, DisasterSafetyData> = {
  Flood: {
    beforeDisaster: {
      title: "Before a Flood",
      tips: [
        "Know your flood risk and understand flood warning systems in your area",
        "Create an emergency kit with water, food, medications, flashlight, batteries, and important documents",
        "Develop an evacuation plan and identify higher ground locations nearby",
        "Consider flood insurance and elevate electrical systems above flood levels",
      ],
    },
    duringDisaster: {
      title: "During a Flood",
      tips: [
        "Move immediately to higher ground if flooding is imminent - do not wait for instructions",
        "Never walk, swim, or drive through flood waters - Turn Around, Don't Drown!",
        "Listen to local news and weather updates for emergency information",
        "Disconnect electrical appliances and avoid touching electrical equipment if wet",
      ],
    },
    afterDisaster: {
      title: "After a Flood",
      tips: [
        "Only return when authorities say it's safe - check for structural damage before entering",
        "Take photos and videos of damage for insurance claims before cleaning up",
        "Clean and disinfect everything touched by floodwater as it may be contaminated",
        "Watch for waterborne diseases and avoid contaminated food and water",
      ],
    },
    firstAid: {
      title: "First Aid for Flood Injuries",
      tips: [
        "Clean all wounds thoroughly with clean water and soap to prevent infection",
        "Watch for signs of hypothermia if exposed to cold flood water",
        "Seek medical attention for any wounds that were exposed to flood water",
        "Be aware of symptoms of waterborne diseases like diarrhea, fever, and nausea",
      ],
    },
    emergencyContacts: [
      { name: "Emergency Services", number: "911", type: "emergency" },
      { name: "Local Emergency Management", number: "311", type: "other" },
      { name: "Red Cross", number: "1-800-733-2767", type: "other" },
    ],
    essentialSupplies: [
      "Water (one gallon per person per day for several days)",
      "Non-perishable food",
      "Battery-powered or hand-crank radio",
      "Flashlight and extra batteries",
      "First aid kit",
      "Medications (7-day supply)",
      "Important documents in waterproof container",
      "Cash and credit cards",
      "Cell phone with chargers",
      "Whistle to signal for help",
    ],
  },
  Earthquake: {
    beforeDisaster: {
      title: "Before an Earthquake",
      tips: [
        "Anchor heavy furniture, appliances, and water heaters to walls",
        "Know where to take cover during an earthquake - under sturdy furniture or against interior walls",
        "Prepare supplies including water, food, first aid, flashlight, and medications",
        "Practice Drop, Cover, and Hold On drills with your family regularly",
      ],
    },
    duringDisaster: {
      title: "During an Earthquake",
      tips: [
        "Drop to your hands and knees, take cover under sturdy furniture, and hold on until shaking stops",
        "Move away from windows, outside doors and walls, and anything that could fall",
        "If outdoors, stay outside, away from buildings, power lines, and trees",
        "If in a vehicle, pull over, stop, and stay inside - avoid bridges, overpasses, and power lines",
      ],
    },
    afterDisaster: {
      title: "After an Earthquake",
      tips: [
        "Check yourself and others for injuries - provide first aid if needed",
        "Be prepared for aftershocks and drop, cover, and hold on if they occur",
        "Look for gas leaks, structural damage, and downed power lines",
        "Let family and friends know you're safe - use text messages to avoid overloading phone lines",
      ],
    },
    firstAid: {
      title: "First Aid for Earthquake Injuries",
      tips: [
        "Apply pressure to bleeding wounds and elevate if possible",
        "Immobilize broken bones and avoid moving seriously injured persons",
        "Check for signs of shock and keep the person warm and calm",
        "Clear airways if someone is having difficulty breathing",
      ],
    },
    emergencyContacts: [
      { name: "Emergency Services", number: "911", type: "emergency" },
      { name: "Gas Company Emergency", number: "1-800-427-2200", type: "other" },
      { name: "Power Company", number: "1-800-743-5000", type: "other" },
    ],
    essentialSupplies: [
      "Water (one gallon per person per day)",
      "Non-perishable food",
      "First aid kit",
      "Flashlight and batteries",
      "Battery-powered radio",
      "Wrench to turn off utilities",
      "Fire extinguisher",
      "Medications",
      "Sturdy shoes",
      "Dust mask",
    ],
  },
  Wildfire: {
    beforeDisaster: {
      title: "Before a Wildfire",
      tips: [
        "Clear vegetation and debris at least 30 feet around your home",
        "Know multiple evacuation routes and have a meeting point for your family",
        "Pack a go-bag with essentials ready to grab if you need to evacuate quickly",
        "Register for local emergency notifications and monitor weather conditions",
      ],
    },
    duringDisaster: {
      title: "During a Wildfire",
      tips: [
        "If told to evacuate, do so immediately - don't wait until you can see flames",
        "If trapped at home, stay inside, close all windows and doors, move to a room farthest from fire",
        "Wear a mask or use a wet cloth to cover your nose and mouth",
        "If smoke is heavy, stay low to the ground where air is cleaner",
      ],
    },
    afterDisaster: {
      title: "After a Wildfire",
      tips: [
        "Only return home when authorities say it's safe to do so",
        "Check for hot spots and smoldering debris - have water ready",
        "Take photos and videos of damage before cleanup for insurance purposes",
        "Be aware of air quality warnings and limit outdoor activities if air is unhealthy",
      ],
    },
    firstAid: {
      title: "First Aid for Wildfire Injuries",
      tips: [
        "Cool burns with cool (not cold) running water for at least 10 minutes",
        "Cover burns with a clean, sterile bandage - don't apply butter or ointments",
        "For smoke inhalation, get to fresh air immediately and monitor breathing",
        "Seek immediate medical attention for severe burns or difficulty breathing",
      ],
    },
    emergencyContacts: [
      { name: "Emergency Services", number: "911", type: "emergency" },
      { name: "Fire Department", number: "911", type: "fire" },
      { name: "Red Cross", number: "1-800-733-2767", type: "other" },
    ],
    essentialSupplies: [
      "N95 masks for smoke",
      "Water",
      "Non-perishable food",
      "Medications",
      "Important documents",
      "Cash",
      "Cell phone and chargers",
      "Change of clothes",
      "Pet supplies if applicable",
      "Flashlight and batteries",
    ],
  },
  Hurricane: {
    beforeDisaster: {
      title: "Before a Hurricane",
      tips: [
        "Know if you live in an evacuation zone and plan your evacuation route",
        "Install storm shutters or board up windows - secure outdoor objects",
        "Have at least 7 days of food, water, and medications ready",
        "Check your insurance coverage and document your belongings",
      ],
    },
    duringDisaster: {
      title: "During a Hurricane",
      tips: [
        "Stay inside and away from windows, skylights, and glass doors",
        "Go to a small interior room, closet, or hallway on the lowest floor",
        "Don't go outside during the calm eye of the storm - the other side will arrive",
        "Keep your battery-powered radio on for updates and instructions",
      ],
    },
    afterDisaster: {
      title: "After a Hurricane",
      tips: [
        "Continue to monitor local news and don't return home until authorities say it's safe",
        "Stay away from standing water, downed power lines, and damaged buildings",
        "Take photos and contact your insurance company as soon as possible",
        "Be aware that flooding can occur even after the hurricane has passed",
      ],
    },
    firstAid: {
      title: "First Aid for Hurricane Injuries",
      tips: [
        "Treat wounds promptly to prevent infection - keep wounds clean and dry",
        "Watch for signs of carbon monoxide poisoning if using generators",
        "Be careful when handling debris - wear gloves and watch for nails and broken glass",
        "Monitor for heat exhaustion if working outdoors without power/AC",
      ],
    },
    emergencyContacts: [
      { name: "Emergency Services", number: "911", type: "emergency" },
      { name: "FEMA", number: "1-800-621-3362", type: "other" },
      { name: "Red Cross", number: "1-800-733-2767", type: "other" },
    ],
    essentialSupplies: [
      "Water (one gallon per person per day for 7 days)",
      "Non-perishable food (7-day supply)",
      "Battery-powered radio",
      "Flashlight and extra batteries",
      "First aid kit",
      "Medications (7-day supply)",
      "Important documents in waterproof bag",
      "Cash",
      "Manual can opener",
      "Plastic sheeting and duct tape",
    ],
  },
  Tornado: {
    beforeDisaster: {
      title: "Before a Tornado",
      tips: [
        "Learn the signs of an approaching tornado: dark greenish sky, large hail, loud roar",
        "Know where you'll go for shelter - basement, storm cellar, or interior room on lowest floor",
        "Practice tornado drills with your family so everyone knows what to do",
        "Keep emergency supplies including water, food, first aid, and flashlight ready",
      ],
    },
    duringDisaster: {
      title: "During a Tornado",
      tips: [
        "Get to the lowest level of a sturdy building - go to a small interior room",
        "Get under sturdy furniture, cover your head and neck with your arms",
        "If outdoors, lie flat in a ditch or low-lying area and cover your head with your hands",
        "If in a vehicle, get out and seek shelter in a sturdy building - don't shelter under an overpass",
      ],
    },
    afterDisaster: {
      title: "After a Tornado",
      tips: [
        "Check yourself and others for injuries - provide first aid if needed",
        "Be alert for broken glass, nails, downed power lines, and gas leaks",
        "Take pictures of damage before cleaning up for insurance purposes",
        "Check on neighbors, especially elderly or disabled individuals",
      ],
    },
    firstAid: {
      title: "First Aid for Tornado Injuries",
      tips: [
        "Apply direct pressure to stop bleeding from cuts and wounds",
        "Stabilize broken bones and avoid moving the injured person unnecessarily",
        "Remove debris carefully from injured persons",
        "Watch for signs of shock and keep victims warm and calm until help arrives",
      ],
    },
    emergencyContacts: [
      { name: "Emergency Services", number: "911", type: "emergency" },
      { name: "Local Emergency Management", number: "311", type: "other" },
      { name: "Red Cross", number: "1-800-733-2767", type: "other" },
    ],
    essentialSupplies: [
      "Water",
      "Non-perishable food",
      "First aid kit",
      "Flashlight and batteries",
      "NOAA Weather Radio",
      "Medications",
      "Important documents",
      "Cell phone and chargers",
      "Sturdy shoes",
      "Helmet for head protection",
    ],
  },
}

// Function to fetch safety data for a specific disaster type
export async function fetchDisasterSafetyData(
  disasterType: string
): Promise<{ success: boolean; data: DisasterSafetyData; error?: string }> {
  try {
    // Normalize the disaster type
    const normalizedType = disasterType.charAt(0).toUpperCase() + disasterType.slice(1).toLowerCase()

    // Check if we have data for this disaster type
    if (fallbackSafetyData[normalizedType]) {
      return {
        success: true,
        data: fallbackSafetyData[normalizedType],
      }
    }

    // If the disaster type is not in our fallback data, return Flood as default
    console.warn(`No safety data found for ${disasterType}, using Flood as default`)
    return {
      success: true,
      data: fallbackSafetyData["Flood"],
      error: "Using fallback data for unsupported disaster type",
    }
  } catch (error) {
    console.error("Error fetching disaster safety data:", error)
    // Return fallback data even on error
    return {
      success: false,
      data: fallbackSafetyData["Flood"],
      error: "Failed to fetch safety data. Using fallback data.",
    }
  }
}
