export interface FeedItem {
  id: string;
  title: string;
  company: string;
  ticker: string;
  sector: string;
  type: 'results' | 'announcement' | 'order' | 'expansion' | 'guidance';
  summary: string;
  timestamp: string;
  isPositive?: boolean;
}

export const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    title: 'Q3 FY25 Results - Revenue Up 18%',
    company: 'Reliance Industries',
    ticker: 'RELIANCE',
    sector: 'Oil & Gas',
    type: 'results',
    summary: 'Consolidated revenue of Rs 2,35,481 crore, up 18% YoY. Petrochemicals segment shows strong recovery with 15% EBITDA growth.',
    timestamp: '2 min ago',
    isPositive: true,
  },
  {
    id: '2',
    title: 'Board Approves Rs 18,000 Cr Buyback',
    company: 'Tata Consultancy Services',
    ticker: 'TCS',
    sector: 'IT Services',
    type: 'announcement',
    summary: 'Buyback price fixed at Rs 4,150 per share. Record date set for January 15, 2025. Maximum shares to be bought back: 4.34 crore.',
    timestamp: '5 min ago',
    isPositive: true,
  },
  {
    id: '3',
    title: 'Capacity Expansion - New Plant in Gujarat',
    company: 'Tata Steel',
    ticker: 'TATASTEEL',
    sector: 'Metals',
    type: 'expansion',
    summary: 'Rs 12,000 crore investment announced for new 3 MTPA steel plant in Mundra. Production to commence by Q4 FY26.',
    timestamp: '8 min ago',
    isPositive: true,
  },
  {
    id: '4',
    title: 'Order Book Update - Rs 45,000 Cr Orders',
    company: 'Larsen & Toubro',
    ticker: 'LT',
    sector: 'Infrastructure',
    type: 'order',
    summary: 'Secured orders worth Rs 45,000 crore in Q3. International orders constitute 35% of new bookings. Order book stands at Rs 4.8 lakh crore.',
    timestamp: '12 min ago',
    isPositive: true,
  },
  {
    id: '5',
    title: 'FY25 Guidance - 12-14% Credit Growth',
    company: 'HDFC Bank',
    ticker: 'HDFCBANK',
    sector: 'Banking',
    type: 'guidance',
    summary: 'Management maintains FY25 credit growth guidance at 12-14%. NIM expected to remain stable at 3.5-3.6%. Asset quality metrics remain strong.',
    timestamp: '15 min ago',
    isPositive: true,
  },
  {
    id: '6',
    title: 'Q3 Results - PAT Grows 22% YoY',
    company: 'Infosys',
    ticker: 'INFY',
    sector: 'IT Services',
    type: 'results',
    summary: 'Net profit of Rs 6,806 crore, up 22% YoY. Revenue growth of 5.8% in constant currency. Large deal TCV at $2.5 billion.',
    timestamp: '18 min ago',
    isPositive: true,
  },
  {
    id: '7',
    title: 'Subsidiary Acquisition Announcement',
    company: 'Bajaj Finance',
    ticker: 'BAJFINANCE',
    sector: 'NBFC',
    type: 'announcement',
    summary: 'Acquires 100% stake in fintech startup for Rs 450 crore. Acquisition to strengthen digital lending capabilities.',
    timestamp: '22 min ago',
    isPositive: true,
  },
  {
    id: '8',
    title: 'Production Update - Record Output',
    company: 'Coal India',
    ticker: 'COALINDIA',
    sector: 'Mining',
    type: 'expansion',
    summary: 'December production at 82 MT, highest ever monthly output. YTD production up 8% at 520 MT. On track to meet FY25 target of 780 MT.',
    timestamp: '25 min ago',
    isPositive: true,
  },
];

export const typeLabels: Record<FeedItem['type'], string> = {
  results: 'Financial Results',
  announcement: 'Corporate Announcement',
  order: 'Order Book',
  expansion: 'Capacity Expansion',
  guidance: 'Future Guidance',
};

export const typeColors: Record<FeedItem['type'], string> = {
  results: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  announcement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  order: 'bg-green-500/20 text-green-400 border-green-500/30',
  expansion: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  guidance: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};
