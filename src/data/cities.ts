export interface City {
  slug: string;
  name: string;
  neighbourhoods: string[];
  lat: number;
  lng: number;
  comingSoon?: boolean;
}

export const CITIES: City[] = [
  { 
    slug: 'london', 
    name: 'London', 
    neighbourhoods: ['Shoreditch', 'Brixton', 'Hackney', 'Dalston', 'Camden', 'Peckham', 'Soho', 'Greenwich', 'Richmond', 'Angel'], 
    lat: 51.5074, 
    lng: -0.1276 
  },
  { slug: 'manchester', name: 'Manchester', neighbourhoods: ['City Centre', 'Northern Quarter', 'Ancoats', 'Chorlton', 'Didsbury'], lat: 53.4808, lng: -2.2426 },
  { slug: 'birmingham', name: 'Birmingham', neighbourhoods: ['City Centre', 'Jewellery Quarter', 'Digbeth', 'Moseley'], lat: 52.4862, lng: -1.8904 },
  { slug: 'leeds', name: 'Leeds', neighbourhoods: ['City Centre', 'Headingley', 'Chapel Allerton'], lat: 53.8008, lng: -1.5491 },
  { slug: 'bristol', name: 'Bristol', neighbourhoods: ['Clifton', 'Stokes Croft', 'Bedminster', 'Redland'], lat: 51.4545, lng: -2.5879 },
  { slug: 'edinburgh', name: 'Edinburgh', neighbourhoods: ['Old Town', 'New Town', 'Leith', 'Stockbridge'], lat: 55.9533, lng: -3.1883 },
  { slug: 'glasgow', name: 'Glasgow', neighbourhoods: ['West End', 'Merchant City', 'Finnieston'], lat: 55.8642, lng: -4.2518 },
  { slug: 'liverpool', name: 'Liverpool', neighbourhoods: ['Baltic Triangle', 'Ropewalks', 'Lark Lane'], lat: 53.4084, lng: -2.9916 },
  { slug: 'newcastle', name: 'Newcastle', neighbourhoods: ['Quayside', 'Jesmond', 'Ouseburn'], lat: 54.9783, lng: -1.6178 },
  { slug: 'sheffield', name: 'Sheffield', neighbourhoods: ['Kelham Island', 'Ecclesall Road', 'City Centre'], lat: 53.3811, lng: -1.4701 },
  { slug: 'cambridge', name: 'Cambridge', neighbourhoods: ['City Centre', 'Mill Road', 'Chesterton'], lat: 52.2053, lng: 0.1218 },
  { slug: 'oxford', name: 'Oxford', neighbourhoods: ['City Centre', 'Jericho', 'Cowley'], lat: 51.7520, lng: -1.2577 },
  { slug: 'york', name: 'York', neighbourhoods: ['City Centre', 'Bishophill', 'Fossgate'], lat: 53.9591, lng: -1.0812 },
  { slug: 'bath', name: 'Bath', neighbourhoods: ['City Centre', 'Walcot', 'Widcombe'], lat: 51.3758, lng: -2.3599 },
  { slug: 'brighton', name: 'Brighton', neighbourhoods: ['The Lanes', 'Kemptown', 'Hove'], lat: 50.8225, lng: -0.1372 },
  { slug: 'nottingham', name: 'Nottingham', neighbourhoods: ['Lace Market', 'Hockley', 'West Bridgford'], lat: 52.9548, lng: -1.1581 },
  { slug: 'leicester', name: 'Leicester', neighbourhoods: ['City Centre', 'Clarendon Park'], lat: 52.6369, lng: -1.1398 },
  { slug: 'coventry', name: 'Coventry', neighbourhoods: ['City Centre', 'Earlsdon'], lat: 52.4068, lng: -1.5197 },
  { slug: 'cardiff', name: 'Cardiff', neighbourhoods: ['City Centre', 'Roath', 'Canton'], lat: 51.4816, lng: -3.1791 },
  { slug: 'belfast', name: 'Belfast', neighbourhoods: ['Cathedral Quarter', 'Titanic Quarter', 'Ormeau Road'], lat: 54.5973, lng: -5.9301 },
];

export const getCityBySlug = (slug: string) => CITIES.find(c => c.slug === slug);
