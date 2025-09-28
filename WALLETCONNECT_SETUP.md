# WalletConnect Integration Setup

## 🚀 Quick Start

### 1. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project or use existing one
3. Copy your Project ID

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Base Network RPC URL (optional)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### 3. Features Included

✅ **Wallet Connection**
- MetaMask support
- WalletConnect support
- Browser wallet support
- Base network integration

✅ **User Interface**
- Modern, responsive design
- Dark theme with blue accents
- Hover animations and effects
- Mobile-friendly

✅ **Functionality**
- Connect/disconnect wallets
- Display wallet address
- Show ETH balance
- Error handling and fallbacks

## 🔧 Technical Details

### Dependencies Used
- `wagmi` - React hooks for Ethereum
- `viem` - TypeScript interface for Ethereum
- `@tanstack/react-query` - Data fetching and caching

### Supported Wallets
- MetaMask
- WalletConnect (mobile wallets)
- Browser injected wallets
- Coinbase Wallet

### Network Support
- Base Mainnet
- Base Sepolia (testnet)

## 🎨 Customization

### Styling
All styles are in `app/components/WalletConnect.module.css`:
- Colors and themes
- Animations and transitions
- Responsive breakpoints
- Hover effects

### Configuration
Modify `app/components/WalletConnect.tsx`:
- Add new connectors
- Change network settings
- Customize UI components

## 🚨 Important Notes

1. **Project ID Required**: You must get a WalletConnect Project ID from their cloud service
2. **HTTPS Required**: WalletConnect requires HTTPS in production
3. **Base Network**: Currently configured for Base mainnet
4. **Error Handling**: Includes fallbacks for connection failures

## 🔗 Useful Links

- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Base Network](https://base.org/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)

## 📱 Mobile Support

The integration works on mobile devices through:
- WalletConnect QR code scanning
- Deep linking to mobile wallets
- Responsive design for all screen sizes
