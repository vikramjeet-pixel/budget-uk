export interface DietTab {
  id: string;
  tag: string; // Firestore tag to filter by
  label: string;
  emoji: string;
  intro: string;
  metaDescription: string;
}

export const DIET_TABS: DietTab[] = [
  {
    id: "halal",
    tag: "halal",
    label: "Halal",
    emoji: "🥩",
    intro:
      "London has one of the best halal food scenes in Europe. East London — particularly Whitechapel, Bethnal Green, and Aldgate — is the heartland, with Bangladeshi, Pakistani, and Middle Eastern restaurants that have been feeding the city for decades. Tooting and Tooting Broadway (SW17) offer a South Asian corridor rivalling anything on the subcontinent. Further north, Green Street in Newham is a must. Nearly every cuisine — Turkish, Persian, West African, Indo-Pakistani — has a strong halal presence; the spots below are verified by community votes.",
    metaDescription:
      "Best halal restaurants and cafés in London — community-verified spots in Whitechapel, Tooting, Green Street, and beyond.",
  },
  {
    id: "vegetarian",
    tag: "vegetarian",
    label: "Vegetarian",
    emoji: "🥗",
    intro:
      "London's vegetarian scene has exploded since 2015. You'll find dedicated vegetarian restaurants across every borough, from the long-standing South Indian tiffin houses of Drummond Street (Euston) and Wembley to the modern plant-forward bistros of Islington and Hackney. Many of the city's best Indian restaurants are fully vegetarian by tradition — especially Gujarati and South Indian spots. The spots below are either fully vegetarian or have menus where vegetarian choices are genuinely the highlight, not an afterthought.",
    metaDescription:
      "Best vegetarian restaurants in London — from South Indian tiffin houses to modern plant-forward bistros across every borough.",
  },
  {
    id: "vegan",
    tag: "vegan",
    label: "Vegan",
    emoji: "🌱",
    intro:
      "Shoreditch and Hackney are the undisputed epicentre of London's vegan scene — a cluster of fully plant-based restaurants, bakeries, and brunch spots that has grown continuously since the mid-2010s. Camden is second, with a dense stretch of vegan street food along the market. Brixton and Peckham have strong Caribbean-influenced vegan spots. What makes London unusual is the quality: many of the best vegan restaurants here could compete with any non-vegan equivalent. The spots below are fully vegan or vegan-dominant.",
    metaDescription:
      "Best vegan restaurants in London — fully plant-based spots in Shoreditch, Hackney, Camden, Brixton, and beyond.",
  },
  {
    id: "gluten-free",
    tag: "gluten-free",
    label: "Gluten-free",
    emoji: "🌾",
    intro:
      "Eating gluten-free in London used to mean scanning menus nervously and hoping. That's changed. Dedicated gluten-free bakeries have opened across the city, and most mid-to-upscale restaurants now train staff on cross-contamination. The safest categories by default: sushi and Japanese restaurants, naturally gluten-free South Indian dishes (dosa, idli, rice-based curries), Ethiopian injera-free plates, and many Thai and Vietnamese restaurants that use rice noodles. The spots below have been noted by the community as reliably safe and satisfying for coeliacs and gluten-avoiders alike.",
    metaDescription:
      "Best gluten-free restaurants and cafés in London — community-verified spots that are genuinely safe for coeliacs.",
  },
];

export const DEFAULT_TAB_ID = "halal";
