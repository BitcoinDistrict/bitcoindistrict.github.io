export interface Supporter {
  rank: number;
  name: string;
  logo: {
    src: string;
    alt: string;
  };
  href: string;
  detailedSection?: {
    title: string;
    subtitle: string;
    content: string;
    callToAction?: {
      text: string;
      href: string;
      icon?: string;
    };
  };
}

export const supporters: Supporter[] = [
  {
    rank: 1,
    name: 'Compass Coffee',
    logo: {
      src: '~/assets/images/brands/compasscoffee.png',
      alt: 'Compass Coffee',
    },
    href: 'https://www.compasscoffee.com',
    detailedSection: {
      title: 'Compass Coffee',
      subtitle: 'Washington DC\'s favorite roaster — and a steadfast supporter of Bitcoiners in the District',
      content: `
        <p>Compass Coffee has been a steadfast supporter of the DMV Bitcoin community — opening their doors for countless meetups, providing a home for BitDevs, and showing up time and again for our events. Their commitment goes beyond great coffee; they've brewed a culture of connection and collaboration.</p> <p>They even crafted a special single-origin <strong>Bitcoin Blend</strong> — a vibrant, caramelly roast honoring El Salvador's leadership and the global Bitcoin movement.</p>
      `,
      callToAction: {
        text: 'Check out the Bitcoin Blend',
        href: 'https://www.compasscoffee.com/products/bitcoin-blend',
        icon: 'tabler:external-link',
      },
    },
  },
  {
    rank: 20,
    name: 'George Washington University',
    logo: {
      src: '~/assets/images/brands/gwu.png',
      alt: 'George Washington University Logo',
    },
    href: 'https://www.gwu.edu',
    detailedSection: {
      title: 'George Washington University',
      subtitle: 'Washington\'s hub for ideas — and a welcoming home for Bitcoin conversation.',
      content: `
      <p>The George Washington University has been a generous supporter of the local Bitcoin community — hosting book talks, BitDevs sessions, and academic discussions that bring together students, builders, and thinkers from across the District.</p>
      <p>Through the <strong>Bitcoin Academic Center</strong> and a spirit of open inquiry, GWU is helping to foster dialogue around Bitcoin's role in technology, economics, and freedom — making space for innovation right in the heart of DC.</p>
    `,
      callToAction: {
        text: 'Learn More About the Bitcoin Academic Center',
        href: 'https://bitcoinacademic.center',
        icon: 'tabler:external-link',
      },
    },
  },
  {
    rank: 10,
    name: 'Bitcoin Policy Institute',
    logo: {
      src: '~/assets/images/brands/bpi.jpg',
      alt: 'Bitcoin Policy Institute Logo',
    },
    href: 'https://www.btcpolicy.org',
    detailedSection: {
      title: 'Bitcoin Policy Institute',
      subtitle: 'Advancing the conversation on Bitcoin policy — and showing up for the community.',
      content: `
        <p>The Bitcoin Policy Institute (BPI) brings clarity and substance to the policy discussion around Bitcoin, producing serious research and helping policymakers understand what’s at stake for open, permissionless systems.</p>
        <p>But they’re not just doing this from afar — BPI has become a real part of the DC Bitcoin community. They join our meetups, share ideas, and help build bridges between local builders and national conversations. Their presence reminds us that thoughtful policy starts with people who care enough to engage directly.</p>
      `,
      callToAction: {
        text: 'Visit Bitcoin Policy Institute',
        href: 'https://www.btcpolicy.org',
        icon: 'tabler:external-link',
      },
    },
  }
  
];

