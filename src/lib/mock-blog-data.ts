import type { BlogPost } from './blog-types'

export const MOCK_POSTS: BlogPost[] = [
  {
    _id: 'mock_post_1',
    _title: 'Welcome to JointSettle: Making Shared Expenses Effortless',
    _slug: 'welcome-to-jointsettle',
    pinned: true,
    subtitle:
      'Discover the easiest way to manage group expenses, split roommate bills, and settle balances without the awkwardness.',
    date: new Date().toISOString(),
    coverImage: {
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&h=675&q=80',
      width: 1200,
      height: 675,
    },
    author: {
      name: 'Alex Rivera',
      avatar: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        width: 150,
        height: 150,
      },
    },
    body: {
      json: {
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "We've all been there: a weekend trip with friends, a shared apartment, or a joint gift for a colleague. Splitting the bill starts with good intentions but often ends in spreadsheets, screenshots of bank transfers, and awkward follow-ups. We built ",
              },
              { type: 'text', text: 'JointSettle', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' to put an end to that cycle.' },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Our mission is simple: take the math and the tension out of shared finances, so you can focus on the experiences that matter.',
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Key Features at a Glance' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Automated Settlement calculations: ',
                        marks: [{ type: 'bold' }],
                      },
                      {
                        type: 'text',
                        text: 'Minimize the total number of bank transfers needed to settle a group.',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Real-time balances: ',
                        marks: [{ type: 'bold' }],
                      },
                      {
                        type: 'text',
                        text: 'Know exactly who is up, who is down, and who owes what at any instant.',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Multiple currencies: ',
                        marks: [{ type: 'bold' }],
                      },
                      {
                        type: 'text',
                        text: 'Seamlessly split bills whether you are home or traveling abroad.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'We have some exciting features planned for the coming months, including deep banking integrations and smart receipt scanning. Subscribe to our feed to stay updated!',
              },
            ],
          },
        ],
      },
    },
  },
  {
    _id: 'mock_post_2',
    _title: '5 Tips for Stress-Free Travel Finances',
    _slug: 'stress-free-travel-finances',
    subtitle:
      "Traveling with friends is an adventure, but splitting the bill shouldn't ruin the mood. Here is how to keep finances clean on the road.",
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    coverImage: {
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&h=675&q=80',
      width: 1200,
      height: 675,
    },
    author: {
      name: 'Sarah Jenkins',
      avatar: {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
        width: 150,
        height: 150,
      },
    },
    body: {
      json: {
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Exploring a new city or relaxing on a beach is the perfect way to recharge. However, group trips are notorious for causing financial friction. Here are five practical tips to make sure everyone stays on the same page.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '1. Agree on a Budget Early' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Different people have different financial comfort levels. Sit down before booking flights or hotels and align on a budget. This avoids situations where one person feels pressured into expensive dinners or high-end accommodations.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              {
                type: 'text',
                text: '2. Assign One Person to Pay for Major Bookings',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "To simplify tracking, have one person make the large upfront bookings (like lodging or car rentals). Log it immediately in JointSettle so the cost is split right away and doesn't get forgotten.",
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              {
                type: 'text',
                text: '3. Keep Track of Cash and Minor Expenses',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "It is easy to forget the small cash payments—cabs, street food, tips. Use JointSettle's quick-add feature to log these on the spot, so they don't add up to a mystery deficit at the end of the trip.",
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              { type: 'text', text: '4. Settle Balances Automatically' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Instead of doing ten bank transfers, let JointSettle's algorithm calculate the most efficient path. Often, a group of five people can settle completely with just one or two transfers.",
              },
            ],
          },
        ],
      },
    },
  },
  {
    _id: 'mock_post_3',
    _title: 'Mastering Roommate Expense Splitting: A Harmonious Guide',
    _slug: 'roommate-expense-splitting',
    subtitle:
      'Co-living is a great way to save money and share life, but utility bills and groceries can cause friction. Here is the ultimate playbook.',
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    coverImage: {
      url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&h=675&q=80',
      width: 1200,
      height: 675,
    },
    author: {
      name: 'Marcus Chen',
      avatar: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        width: 150,
        height: 150,
      },
    },
    body: {
      json: {
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Living with roommates can be one of the best experiences of your youth, but money is a common source of conflict. Shared groceries, internet bills, electricity, and toilet paper can build up resentment if not tracked transparently.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Create a Shared Agreement' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Before moving in or at the start of a new lease, establish clear rules about what expenses are shared. Is toilet paper a communal expense? How about coffee? Write it down and put it in a shared doc.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Simplify Utility Splitting' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Set up utility accounts in different roommates' names if possible (e.g., roommate A pays electricity, roommate B pays internet). Then, put both bills into JointSettle. Our system will automatically balance the payments, minimizing what needs to be manually transferred.",
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Transparency is the key to roommate bliss. When everyone can see the ledger, trust is built naturally.',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    _id: 'mock_post_4',
    _title: 'Behind the Code: Our Debt Simplification Algorithm',
    _slug: 'debt-simplification-algorithm',
    subtitle:
      "Ever wondered how we reduce a complex web of group debts into just a few simple transactions? Let's take a look at the math and graphs.",
    date: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    coverImage: {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
      width: 1200,
      height: 675,
    },
    author: {
      name: 'Elena Rostova',
      avatar: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        width: 150,
        height: 150,
      },
    },
    body: {
      json: {
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "When ten people go on a trip, they make dozens of payments. Person A pays for gas. Person B pays for lodging. Person C buys groceries, which Person A and Person D didn't consume. If you settle every transaction directly, you end up with a huge number of bank transfers.",
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              { type: 'text', text: 'The Transaction Minimization Problem' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Mathematically, this is modeled as a directed graph where nodes represent people and directed edges represent debts. The goal is to find an equivalent graph with the same net balances but the minimum number of edges (transactions).',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Here is a simplified version of our greedy algorithm in TypeScript:',
              },
            ],
          },
          {
            type: 'codeBlock',
            content: [
              {
                type: 'text',
                text: `interface Participant {
  name: string;
  balance: number; // positive means they are owed, negative means they owe
}

function simplifyDebts(participants: Participant[]) {
  const debtors = participants.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = participants.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
  const transactions = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    transactions.push({ from: debtor.name, to: creditor.name, amount });
    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }
  return transactions;
}`,
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'By netting out balances, we reduce the total friction of group payments, saving everyone time and bank transfer fees.',
              },
            ],
          },
        ],
      },
    },
  },
  {
    _id: 'mock_post_5',
    _title: 'Smart Budgeting for Couples: Share Expenses, Keep Independence',
    _slug: 'smart-budgeting-couples-2026',
    subtitle:
      'How to manage joint finances with your partner without losing your personal financial freedom or combining all bank accounts.',
    date: new Date(Date.now() - 86400000 * 18).toISOString(), // 18 days ago
    coverImage: {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=675&q=80',
      width: 1200,
      height: 675,
    },
    author: {
      name: 'David Vance',
      avatar: {
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
        width: 150,
        height: 150,
      },
    },
    body: {
      json: {
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Money is one of the leading causes of relationship stress. Traditionally, couples had two options: keep everything separate and painstakingly divide every bill, or open a joint account and lose complete visibility over individual spending.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              { type: 'text', text: 'The Proportional Contribution Model' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'A popular modern approach is contributing to joint expenses proportionally based on income. If Partner A earns 60% of the household income and Partner B earns 40%, joint bills are split 60/40.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'With JointSettle, you can configure custom weights for specific expense categories. When you log rent, it splits 60/40. When you log dinner, you can split it 50/50. This gives couples the ultimate flexibility to manage their money in a way that feels fair to both partners.',
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: "A healthy financial relationship isn't about splitting everything perfectly down the middle; it's about transparency, shared expectations, and mutual respect.",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
]
