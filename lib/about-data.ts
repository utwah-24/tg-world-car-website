export type AboutStat =
  | {
      label: string
      type: "count"
      to: number
      suffix?: string
      illustration: string
      illustrationAlt: string
    }
  | {
      label: string
      type: "text"
      value: string
      illustration: string
      illustrationAlt: string
    }

export const aboutStats: AboutStat[] = [
  {
    type: "count",
    to: 1200,
    suffix: "+",
    label: "Vehicles Sold",
    illustration: "/illustrations/sold_cars.svg",
    illustrationAlt: "Vehicles sold",
  },
  {
    type: "count",
    to: 5000,
    suffix: "+",
    label: "Happy Customers",
    illustration: "/illustrations/happy_customers.svg",
    illustrationAlt: "Happy customers",
  },
  {
    type: "count",
    to: 15,
    suffix: "+",
    label: "Years Experience",
    illustration: "/illustrations/years_xp.svg",
    illustrationAlt: "Years of experience",
  },
  {
    type: "text",
    value: "Japan to TZ",
    label: "Global Standards",
    illustration: "/illustrations/global_std.png",
    illustrationAlt: "Global standards",
  },
]

export type TeamMember = {
  id: string
  name: string
  role: string
  bio: string
  /** Set when you add team photos, e.g. `/team/sharif.jpg` */
  imageSrc?: string
  /** Placeholder tint when no photo */
  placeholderClass: string
  phone?: string
  email?: string
  whatsapp?: string
}

export const teamMembers: TeamMember[] = [
  {
    id: "deo",
    name: "Deo",
    role: "Founder & CEO",
    bio: "Visionary leader and founder of TG World. He ensures we deliver quality, trust and value in every deal we make.",
    imageSrc: "/Team%20/Deo/deo.jpeg",
    placeholderClass: "bg-orange-100",
  },
  {
    id: "sharif",
    name: "Sharif",
    role: "Marketing & Sales Manager",
    bio: "Leads our maketing strategies and drives sales growth. Focused on connecting TG World with more happy customers.",
    imageSrc: "/Team%20/Sharif/sharif.jpeg",
    placeholderClass: "bg-sky-100",
  },
  {
    id: "malaika",
    name: "Malaika / Angel",
    role: "Receptionist & Sales Executive",
    bio: "The friendly face of Tg world. Handles client relations and supports the sales team to ensure a smooth experience.",
    imageSrc: "/Team%20/malaika/malaika.jpeg",
    placeholderClass: "bg-violet-100",
  },
  {
    id: "calvin",
    name: "Calvin",
    role: "Sales & Logistics Executive",
    bio: "Handles sales support, test drives and vehicle deliveries. Ensures cars move safely to and from bond warehouse to a customers front doors.",
    imageSrc: "/Team%20/Calvin/Calvin.jpeg",
    placeholderClass: "bg-emerald-100",
  },
  {
    id: "goodluck",
    name: "Goodluck",
    role: "Operations & Maintanance Lead",
    bio: "Manages mechanics, Oversees cleaning neatness, office errands and other personnel to keep everything running smoothly.",
    imageSrc: "/Team%20/Goodluck/Goodluck.jpeg",
    placeholderClass: "bg-amber-100",
  },
  {
    id: "gaudence",
    name: "Gaudence",
    role: "Car Care Specialist",
    bio: "Ensures every vehicle is prepared, detailed, and ready before it reaches you.",
    imageSrc: "/Team%20/Gaudence/Gaudence.jpeg",
    placeholderClass: "bg-lime-100",
  },
]
