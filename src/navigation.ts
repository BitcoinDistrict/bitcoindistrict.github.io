import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Events',
      href: getPermalink('/events'),
    },
    {
      text: 'Meetups',
      href: getPermalink('/meetups'),
    },
    {
      text: 'DC BitPlebs',
      href: getPermalink('/dcbitplebs'),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'News',
      href: getPermalink('https://news.bitcoindistrict.org'),
    },
    {
      text: 'Resources',
      links: [
        { text: 'Learn', href: getPermalink('/learn') },
        { text: 'Merchants', href: getPermalink('/merchants') },
        { text: 'Nostr', href: getPermalink('/nostr') },
        { text: 'Thanks', href: getPermalink('/thanks') },
      ],
    },
  ],
  actions: [{ text: 'Blog', href: '/blog', target: '_self' }],
};

export const footerData = {
  links: [
    {
      title: 'Meetups 🤝',
      links: [
        { text: 'Bitcoin District', href: 'https://www.meetup.com/bitcoin-district/' },
        { text: 'DC BitDevs', href: 'https://www.meetup.com/dc-bit-devs/' },
        { text: 'Shenandoah Bitcoin Club', href: 'https://www.meetup.com/shenandoah-bitcoin-club/' },
        { text: 'Southern Maryland Bitcoiners', href: 'https://www.meetup.com/southern-maryland-bitcoiners/' },
      ],
    },
    {
      title: 'Friends 🤗',
      links: [
        { text: 'Bitcoin District Initiative', href: 'https://www.bitcoindistrictinitiative.org/' },
        { text: 'Bitcoin Policy Institute', href: 'https://www.btcpolicy.org/' },
        { text: 'PubKey DC', href: 'https://pubkey.bar/' },
        { text: 'Strategy Hub', href: 'https://strategy.com/hub' }
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
    { text: 'Contact', href: '/contact' },
  ],
  newsletter: {
    title: 'Subscribe to our newsletter',
    enabled: true
  },
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://x.com/BTCDistrict' },
    { ariaLabel: 'Nostr', icon: 'nostr', href: 'https://primal.net/p/npub1mcke7stw5mrqp97lmdu0qdrfcz2uertdsy2n9pzvfnsdutx3hvkq7d5mnw' },
    //{ ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    //{ ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/BitcoinDistrict' },
  ],
  footNote: `
    Copyright © ${new Date().getFullYear()} Bitcoin District · All rights reserved.
  `,
};
