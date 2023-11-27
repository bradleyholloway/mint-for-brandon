const moment = require('moment')
const client = require('./plaidClient')

// start from beginning of last month...
const startDate = moment()
  .subtract(1, 'month')
  .startOf('month')
  .format('YYYY-MM-DD');
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
const endDate = moment().format('YYYY-MM-DD')



const plaidAccountTokens = Object.keys(process.env)
  .filter(key => key.startsWith(`PLAID_TOKEN`))
  .map(key => ({
    account: key.replace(/^PLAID_TOKEN_/, ''),
    token: process.env[key]
  }))

exports.fetchTransactions = async function() {
  const rawTransactions = await Promise.all(plaidAccountTokens.map(async ({ account, token }) => {
    const request = {
      access_token: token,
      start_date: startDate,
      end_date: endDate
    };

    try {
      const response = await client.transactionsGet(request);
      let transactions = response.data.transactions;
      const total_transactions = response.data.total_transactions;
      // Manipulate the offset parameter to paginate
      // transactions and retrieve all available data
      while (transactions.length < total_transactions) {
        const paginatedRequest = {
          access_token: token,
          start_date: startDate,
          end_date: endDate,
          options: {
            offset: transactions.length
          },
        };
        const paginatedResponse = await client.transactionsGet(paginatedRequest);
        transactions = transactions.concat(
          paginatedResponse.data.transactions,
        );
      }

      //console.log(transactions);

      return {account, transactions};
    } catch(err)  {
      // handle error
      console.log("error in fetching transactions: " + err);
    }
  }))

  // console.log(rawTransactions);

  // concat all transactions
  return rawTransactions.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, date, amount, transaction_id, personal_finance_category }) => ({
      transaction_id,
      account,
      name,
      date,
      amount: -amount,
      category: personal_finance_category.primary,
      subcategory: personal_finance_category.detailed,
      cat_confidence: personal_finance_category.confidence_level
    })))
  }, [])
}

exports.fetchBalances = async function() {
  const rawBalances = await Promise.all(plaidAccountTokens.map(({ account, token }) => {
    return client.getBalance(token)
  }))

  return rawBalances.reduce((all, { accounts }) => {
    return all.concat(accounts.map(({ name, balances }) => ({
      name,
      balance: balances.current
    })))
  }, [])
}
