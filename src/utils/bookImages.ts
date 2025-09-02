// Import all book cover images
import abundance from '~/assets/images/books/abundance.jpg';
import bitcoinage from '~/assets/images/books/bitcoinage.jpg';
import blocksizewar from '~/assets/images/books/blocksizewar.jpg';
import bigprint from '~/assets/images/books/bigprint.jpg';
import boom from '~/assets/images/books/boom.jpg';
import bushido from '~/assets/images/books/bushido.jpg';
import chasingseeds from '~/assets/images/books/chasingseeds.jpg';
import deficitmyth from '~/assets/images/books/deficitmyth.jpg';
import ethicsofmoney from '~/assets/images/books/ethicsofmoney.jpg';
import financialprivilege from '~/assets/images/books/financialprivilege.jpg';
import freeprivatecities from '~/assets/images/books/freeprivatecities.jpg';
import genesisbook from '~/assets/images/books/genesisbook.jpg';
import hiddenrepression from '~/assets/images/books/hiddenrepression.jpg';
import historyofcentralbanking from '~/assets/images/books/historyofcentralbanking.jpg';
import jekyllisland from '~/assets/images/books/jekyllisland.jpg';
import lordsoffinance from '~/assets/images/books/lordsoffinance.jpg';
import mandibles from '~/assets/images/books/mandibles.jpg';
import papersoldiers from '~/assets/images/books/papersoldiers.jpg';
import priceoftime from '~/assets/images/books/priceoftime.jpg';
import priceoftomorrow from '~/assets/images/books/priceoftomorrow.jpg';
import privatizatinofmoney from '~/assets/images/books/privatizatinofmoney.jpg';
import resistancemoney from '~/assets/images/books/resistancemoney.jpg';
import salt from '~/assets/images/books/salt.jpg';
import satoshipapers from '~/assets/images/books/satoshipapers.jpg';
import softwar from '~/assets/images/books/softwar.jpg';
import sovereignindividual from '~/assets/images/books/sovereignindividual.jpg';
import superagency from '~/assets/images/books/superagency.jpg';
import theSeventh from '~/assets/images/books/7th.jpg';
import twentyFour from '~/assets/images/books/24.jpg';
import venice from '~/assets/images/books/venice.jpg';
import whenmoneydies from '~/assets/images/books/whenmoneydies.jpg';
import whybitcoin from '~/assets/images/books/whybitcoin.jpg';
import wouldmao from '~/assets/images/books/wouldmao.jpg';
import bitcoinhard from '~/assets/images/books/bitcoinhard.jpg';

// Create a mapping from image path strings to imported images
export const bookImageMap: Record<string, any> = {
  '~/assets/images/books/abundance.jpg': abundance,
  '~/assets/images/books/bitcoinage.jpg': bitcoinage,
  '~/assets/images/books/blocksizewar.jpg': blocksizewar,
  '~/assets/images/books/bigprint.jpg': bigprint,
  '~/assets/images/books/boom.jpg': boom,
  '~/assets/images/books/bushido.jpg': bushido,
  '~/assets/images/books/chasingseeds.jpg': chasingseeds,
  '~/assets/images/books/deficitmyth.jpg': deficitmyth,
  '~/assets/images/books/ethicsofmoney.jpg': ethicsofmoney,
  '~/assets/images/books/financialprivilege.jpg': financialprivilege,
  '~/assets/images/books/freeprivatecities.jpg': freeprivatecities,
  '~/assets/images/books/genesisbook.jpg': genesisbook,
  '~/assets/images/books/hiddenrepression.jpg': hiddenrepression,
  '~/assets/images/books/historyofcentralbanking.jpg': historyofcentralbanking,
  '~/assets/images/books/jekyllisland.jpg': jekyllisland,
  '~/assets/images/books/lordsoffinance.jpg': lordsoffinance,
  '~/assets/images/books/mandibles.jpg': mandibles,
  '~/assets/images/books/papersoldiers.jpg': papersoldiers,
  '~/assets/images/books/priceoftime.jpg': priceoftime,
  '~/assets/images/books/priceoftomorrow.jpg': priceoftomorrow,
  '~/assets/images/books/privatizatinofmoney.jpg': privatizatinofmoney,
  '~/assets/images/books/resistancemoney.jpg': resistancemoney,
  '~/assets/images/books/salt.jpg': salt,
  '~/assets/images/books/satoshipapers.jpg': satoshipapers,
  '~/assets/images/books/softwar.jpg': softwar,
  '~/assets/images/books/sovereignindividual.jpg': sovereignindividual,
  '~/assets/images/books/superagency.jpg': superagency,
  '~/assets/images/books/7th.jpg': theSeventh,
  '~/assets/images/books/24.jpg': twentyFour,
  '~/assets/images/books/venice.jpg': venice,
  '~/assets/images/books/whenmoneydies.jpg': whenmoneydies,
  '~/assets/images/books/whybitcoin.jpg': whybitcoin,
  '~/assets/images/books/wouldmao.jpg': wouldmao,
  '~/assets/images/books/bitcoinhard.jpg': bitcoinhard,
};

// Helper function to get the imported image from a path string
export function getBookImage(imagePath: string) {
  return bookImageMap[imagePath];
}