export interface Testimonial {
  testimonial: string;
  name: string;
  job: string;
  image: {
    src: string;
    alt: string;
  };
}

export const testimonials: Testimonial[] = [
  {
    testimonial: `I emerged from the digital shadows to attend a Bitcoin District meetup, and wow, what a blast! Between the real good coffee and debates over inscriptions, I nearly revealed my identity just to settle a 10-minute rant about forks—turns out, staying mysterious is cheaper than winning arguments. The coffee was as strong as the hodlers, though, so I'll be back!`,
    name: 'Satoshi Nakamoto',
    job: 'Elusive Creator of Bitcoin',
    image: {
      src: '~/assets/images/profiles/satoshi.png',
      alt: 'Satoshi Nakamoto',
    },
  },
  {
    testimonial: `I rolled into the Bitcoin District meetup thinking I'd school these degens on why QE infinity keeps the world spinning. Big nope. They hit me with 'inflation is theft' and '1 BTC = 1 BTC' so hard I nearly choked on my freshly printed dollar bills. By the end, they were preaching 'HODL forever' while I was googling how to escape a room full of laser-eyed maxis. 10/10, my printer's still shaking.`,
    name: 'Jerome Powell',
    job: 'Fiat Overlord of the Federal Reserve',
    image: {
      src: '~/assets/images/profiles/jp.png',
      alt: 'Fiat Overlord',
    },
  },
  {
    testimonial: `I strolled into the Bitcoin District meetup, ready to dazzle everyone with XRP's genius as a bridge currency. Oops. The maxis stared at me like I'd just praised paper money, then broke into a chorus of 'there's only one coin' and 'enjoy your altcoin fantasy.' One guy even slipped me a 'hope you recover' note for my XRP stash. I walked out humbled—slightly toasted—but clutching a shiny new Bitcoin sticker. Worth it?`,
    name: 'Chad Moonboy',
    job: 'XRP Army',
    image: {
      src: '~/assets/images/profiles/chad.png',
      alt: 'Chad Moonboi',
    },
  },
  {
    testimonial: `The Bitcoin District meetup was a refreshing dive into a community passionate about sound money and decentralization. Their engaging discussions on node running and layer-2 solutions inspired me to contribute more to Bitcoin's ecosystem.`,
    name: 'Elena Sato',
    job: 'Developer',
    image: {
      src: '~/assets/images/profiles/elena.png',
      alt: 'Elena Sato',
    },
  },
  {
    testimonial: `I showed up to the Bitcoin & Coffee Meetup ready to casually mention my old altcoin bags, but the Bitcoin District crew shut that down faster than China banned Bitcoin... again. They preached 'work hard, stay humble, stack sats' with such enthusiasm I'm now dreaming in orange and quoting Satoshi in my sleep—send help and more coffee!`,
    name: 'Vicky HODLsworth',
    job: 'Former Altcoin Dabbler turned Bitcoin Maxi',
    image: {
      src: '~/assets/images/profiles/vicky.png',
      alt: 'Chad Moonboy',
    },
  },
  {
    testimonial: `I rolled into the Bitcoin District's Bitcoin and Cigars Meetup expecting a chill smoke sesh, but these maxis lit up the room with 'HODL or bust' quips sharper than my cigar cutter! By the time we debated Satoshi's whitepaper over a cloud of Cubans, I was ready to trade my entire humidor for a full node setup—puff, puff, pass the sats!`,
    name: 'Tommy Calzone',
    job: 'I just like cigars',
    image: {
      src: '~/assets/images/profiles/tommy.png',
      alt: 'Tommy Calzone',
    },
  },
];