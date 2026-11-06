/** Fictional tuning data, created for the game. Never supplier rates or live quotes. */
export const destinations = [
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    code: "LHR",
    lon: -0.12,
    lat: 51.5,
    flight: 340,
    hotel: 380,
    demand: 11,
    appeal: "Culture, theatre & city discovery",
    risk: "High competition; value positioning travels well.",
    color: "#93b9d8",
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Indian Ocean",
    code: "MLE",
    lon: 73.51,
    lat: 4.18,
    flight: 650,
    hotel: 720,
    demand: 7,
    appeal: "Island escapes & considered luxury",
    risk: "Higher costs; premium accommodation earns trust.",
    color: "#67cbbd",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    code: "DXB",
    lon: 55.27,
    lat: 25.2,
    flight: 400,
    hotel: 410,
    demand: 10,
    appeal: "Architecture, dining & winter sun",
    risk: "Crowded market; product clarity matters.",
    color: "#dfbc83",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    code: "HND",
    lon: 139.69,
    lat: 35.68,
    flight: 690,
    hotel: 430,
    demand: 9,
    appeal: "Neighbourhoods, design & discovery",
    risk: "Long-haul flights put pressure on the package cost.",
    color: "#d9a5be",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    code: "DPS",
    lon: 115.19,
    lat: -8.65,
    flight: 610,
    hotel: 250,
    demand: 13,
    appeal: "Nature, wellness & island culture",
    risk: "Strong demand, with price-sensitive travellers.",
    color: "#95c7a0",
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    code: "JFK",
    lon: -74.0,
    lat: 40.71,
    flight: 490,
    hotel: 540,
    demand: 9,
    appeal: "Art, energy & iconic city breaks",
    risk: "Hotel costs reward disciplined packaging.",
    color: "#a5b6df",
  },
] as const;
export type DestinationId = (typeof destinations)[number]["id"];
export const hotels = [
  {
    id: "essential",
    name: "Essential stay",
    multiplier: 0.72,
    satisfaction: -5,
    appeal: 1.08,
    detail: "Simple comforts. Lower cost, fewer touches.",
  },
  {
    id: "boutique",
    name: "Boutique character",
    multiplier: 1,
    satisfaction: 4,
    appeal: 1,
    detail: "A distinctive stay with balanced costs.",
  },
  {
    id: "luxury",
    name: "Luxury retreat",
    multiplier: 1.65,
    satisfaction: 11,
    appeal: 0.87,
    detail: "Elevated service. A higher price to justify.",
  },
] as const;
export const flights = [
  {
    id: "connection",
    name: "Connecting",
    multiplier: 0.78,
    satisfaction: -5,
    detail: "Lower cost; longer journeys.",
  },
  {
    id: "direct",
    name: "Direct",
    multiplier: 1,
    satisfaction: 3,
    detail: "Convenience at the standard game fare.",
  },
  {
    id: "flexible",
    name: "Flexible ticket",
    multiplier: 1.22,
    satisfaction: 7,
    detail: "More expensive; protection in a cancellation.",
  },
] as const;
export const pricing = [
  {
    id: "value",
    name: "Accessible value",
    markup: 0.14,
    demand: 1.2,
    satisfaction: 5,
    detail: "14% cost markup · volume-led.",
  },
  {
    id: "balanced",
    name: "Considered balance",
    markup: 0.3,
    demand: 1,
    satisfaction: 1,
    detail: "30% cost markup · balanced appeal.",
  },
  {
    id: "premium",
    name: "Premium positioning",
    markup: 0.52,
    demand: 0.7,
    satisfaction: -4,
    detail: "52% cost markup · fewer, higher-value bookings.",
  },
] as const;
export const contracts = [
  {
    id: "on-demand",
    name: "On-demand supplier",
    discount: 0,
    detail: "Pay for booked packages only. No inventory penalty.",
  },
  {
    id: "allotment",
    name: "Negotiated allotment",
    discount: 0.12,
    detail:
      "12% unit-cost discount. Unfilled places incur a 35% release charge on up to four places.",
  },
] as const;
export type EventOption = {
  label: string;
  detail: string;
  cost: number;
  demand: number;
  reputation: number;
  satisfaction: number;
};
export const events: {
  id: string;
  name: string;
  story: string;
  options: readonly [EventOption, EventOption];
}[] = [
  {
    id: "cancellation",
    name: "Flight cancellation",
    story: "A scheduled service is cancelled. Your travellers need a plan.",
    options: [
      {
        label: "Protect the journey",
        detail:
          "£420 recovery cost; flexible tickets reduce this to £84. Retain trust.",
        cost: 420,
        demand: 0.98,
        reputation: 6,
        satisfaction: 8,
      },
      {
        label: "Offer a later departure",
        detail: "£80 admin cost. Lose some bookings and convenience.",
        cost: 80,
        demand: 0.72,
        reputation: -5,
        satisfaction: -8,
      },
    ],
  },
  {
    id: "overbooking",
    name: "Resort overbooking",
    story: "Your preferred hotel cannot honour every room.",
    options: [
      {
        label: "Secure an equivalent upgrade",
        detail: "£360 recovery cost; protect the promise.",
        cost: 360,
        demand: 1,
        reputation: 5,
        satisfaction: 7,
      },
      {
        label: "Offer an alternative & credit",
        detail: "£140 cost; some guests accept a simpler stay.",
        cost: 140,
        demand: 0.88,
        reputation: -2,
        satisfaction: -5,
      },
    ],
  },
  {
    id: "luxury",
    name: "Unexpected luxury demand",
    story: "A new audience is looking for distinctive, premium experiences.",
    options: [
      {
        label: "Curate a premium experience",
        detail: "£260 curation cost. Luxury stays gain a further demand bonus.",
        cost: 260,
        demand: 1.22,
        reputation: 5,
        satisfaction: 5,
      },
      {
        label: "Keep the original brief",
        detail: "No extra spend; a modest uplift in interest.",
        cost: 0,
        demand: 1.06,
        reputation: 1,
        satisfaction: 0,
      },
    ],
  },
  {
    id: "supplier",
    name: "Supplier opportunity",
    story: "A partner offers a tactical incentive for a limited campaign.",
    options: [
      {
        label: "Negotiate campaign support",
        detail:
          "£220 supplier contribution (income); slightly narrower appeal.",
        cost: -220,
        demand: 0.94,
        reputation: 0,
        satisfaction: -1,
      },
      {
        label: "Keep product flexibility",
        detail: "No contribution, but wider appeal and choice.",
        cost: 0,
        demand: 1.12,
        reputation: 2,
        satisfaction: 3,
      },
    ],
  },
  {
    id: "recovery",
    name: "A service recovery moment",
    story: "An arrival experience falls short of expectations.",
    options: [
      {
        label: "Personalise the recovery",
        detail: "£240 care cost; recover satisfaction and trust.",
        cost: 240,
        demand: 1,
        reputation: 7,
        satisfaction: 10,
      },
      {
        label: "Issue a modest credit",
        detail: "£90 cost; a practical response with less personal care.",
        cost: 90,
        demand: 0.97,
        reputation: -1,
        satisfaction: -3,
      },
    ],
  },
  {
    id: "currency",
    name: "Currency fluctuation",
    story:
      "Exchange-rate pressure changes the cost of servicing this departure.",
    options: [
      {
        label: "Absorb the pressure",
        detail: "£310 cost; honour the original proposition.",
        cost: 310,
        demand: 1.04,
        reputation: 4,
        satisfaction: 5,
      },
      {
        label: "Rework the inclusions",
        detail: "£60 adjustment cost. Fewer inclusions reduce appeal.",
        cost: 60,
        demand: 0.86,
        reputation: -2,
        satisfaction: -5,
      },
    ],
  },
  {
    id: "competition",
    name: "Competitor price war",
    story: "The market is crowded with discounted packages.",
    options: [
      {
        label: "Invest in added value",
        detail:
          "£250 experience cost; support demand without changing the price.",
        cost: 250,
        demand: 1.2,
        reputation: 3,
        satisfaction: 4,
      },
      {
        label: "Hold your positioning",
        detail: "No campaign spend; accept fewer bookings.",
        cost: 0,
        demand: 0.8,
        reputation: 2,
        satisfaction: 0,
      },
    ],
  },
  {
    id: "viral",
    name: "A destination goes viral",
    story:
      "Unexpected attention brings new interest, alongside higher expectations.",
    options: [
      {
        label: "Build a responsible campaign",
        detail: "£190 campaign cost; a strong demand uplift.",
        cost: 190,
        demand: 1.35,
        reputation: 4,
        satisfaction: 2,
      },
      {
        label: "Grow at a measured pace",
        detail: "No campaign spend; lower volume and more personal care.",
        cost: 0,
        demand: 1.08,
        reputation: 3,
        satisfaction: 6,
      },
    ],
  },
];
