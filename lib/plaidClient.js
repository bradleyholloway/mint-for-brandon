const plaid = require('plaid')

const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

module.exports = new plaid.PlaidApi(configuration);
