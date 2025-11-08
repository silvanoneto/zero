(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,271502,e=>{"use strict";e.i(812207);var t=e.i(604148),o=e.i(654479);e.i(374576);var r=e.i(120119),i=e.i(56350);e.i(234051);var a=e.i(829389),n=e.i(886259),s=e.i(960398),l=e.i(149454),c=e.i(803468),d=e.i(971080),u=e.i(221728),p=e.i(218454);let m={isUnsupportedChainView:()=>"UnsupportedChain"===u.RouterController.state.view||"SwitchNetwork"===u.RouterController.state.view&&u.RouterController.state.history.includes("UnsupportedChain"),async safeClose(){this.isUnsupportedChainView()||await p.SIWXUtil.isSIWXCloseDisabled()?c.ModalController.shake():(("DataCapture"===u.RouterController.state.view||"DataCaptureOtpConfirm"===u.RouterController.state.view)&&d.ConnectionController.disconnect(),c.ModalController.close())}};var h=e.i(82283),w=e.i(811424),g=e.i(365801),f=e.i(742710),v=e.i(675457),y=e.i(401564),b=e.i(979484),k=e.i(518887),C=e.i(564126),x=e.i(360334),T=e.i(227302),S=e.i(664717);let A={getGasPriceInEther:(e,t)=>Number(t*e)/1e18,getGasPriceInUSD(e,t,o){let r=A.getGasPriceInEther(t,o);return v.NumberUtil.bigNumber(e).times(r).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:r}){let i=v.NumberUtil.bigNumber(e).times(t),a=v.NumberUtil.bigNumber(r).times(o);return i.minus(a).div(i).times(100).toNumber()},getMaxSlippage(e,t){let o=v.NumberUtil.bigNumber(e).div(100);return v.NumberUtil.multiply(t,o).toNumber()},getProviderFee:(e,t=.0085)=>v.NumberUtil.bigNumber(e).times(t).toString(),isInsufficientNetworkTokenForGas:(e,t)=>!!v.NumberUtil.bigNumber(e).eq(0)||v.NumberUtil.bigNumber(v.NumberUtil.bigNumber(t||"0")).gt(e),isInsufficientSourceTokenForSwap(e,t,o){let r=o?.find(e=>e.address===t)?.quantity?.numeric;return v.NumberUtil.bigNumber(r||"0").lt(e)}};var $=e.i(592279),P=e.i(851887),E=e.i(24742),R=e.i(653157);let I={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:x.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},N=(0,g.proxy)({...I}),O={state:N,subscribe:e=>(0,g.subscribe)(N,()=>e(N)),subscribeKey:(e,t)=>(0,f.subscribeKey)(N,e,t),getParams(){let e=s.ChainController.state.activeChain,t=s.ChainController.getAccountData(e)?.caipAddress??s.ChainController.state.activeCaipAddress,o=T.CoreHelperUtil.getPlainAddress(t),r=(0,C.getActiveNetworkTokenAddress)(),i=l.ConnectorController.getConnectorId(s.ChainController.state.activeChain);if(!o)throw Error("No address found to swap the tokens from.");let a=!N.toToken?.address||!N.toToken?.decimals,n=!N.sourceToken?.address||!N.sourceToken?.decimals||!v.NumberUtil.bigNumber(N.sourceTokenAmount).gt(0),c=!N.sourceTokenAmount;return{networkAddress:r,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:N.sourceToken?.address,toTokenAddress:N.toToken?.address,toTokenAmount:N.toTokenAmount,toTokenDecimals:N.toToken?.decimals,sourceTokenAmount:N.sourceTokenAmount,sourceTokenDecimals:N.sourceToken?.decimals,invalidToToken:a,invalidSourceToken:n,invalidSourceTokenAmount:c,availableToSwap:t&&!a&&!n&&!c,isAuthConnector:i===y.ConstantsUtil.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){N.sourceToken=e,N.sourceTokenAmount="",N.sourceTokenPriceInUSD=0;return}N.sourceToken=e,await W.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){N.sourceTokenAmount=e},async setToToken(e){if(!e){N.toToken=e,N.toTokenAmount="",N.toTokenPriceInUSD=0;return}N.toToken=e,await W.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){N.toTokenAmount=e?v.NumberUtil.toFixed(e,6):""},async setTokenPrice(e,t){let o=N.tokensPriceMap[e]||0;o||(N.loadingPrices=!0,o=await W.getAddressPrice(e)),"sourceToken"===t?N.sourceTokenPriceInUSD=o:"toToken"===t&&(N.toTokenPriceInUSD=o),N.loadingPrices&&(N.loadingPrices=!1),W.getParams().availableToSwap&&!N.switchingTokens&&W.swapTokens()},async switchTokens(){if(!N.initializing&&N.initialized&&!N.switchingTokens){N.switchingTokens=!0;try{let e=N.toToken?{...N.toToken}:void 0,t=N.sourceToken?{...N.sourceToken}:void 0,o=e&&""===N.toTokenAmount?"1":N.toTokenAmount;W.setSourceTokenAmount(o),W.setToTokenAmount(""),await W.setSourceToken(e),await W.setToToken(t),N.switchingTokens=!1,W.swapTokens()}catch(e){throw N.switchingTokens=!1,e}}},resetState(){N.myTokensWithBalance=I.myTokensWithBalance,N.tokensPriceMap=I.tokensPriceMap,N.initialized=I.initialized,N.initializing=I.initializing,N.switchingTokens=I.switchingTokens,N.sourceToken=I.sourceToken,N.sourceTokenAmount=I.sourceTokenAmount,N.sourceTokenPriceInUSD=I.sourceTokenPriceInUSD,N.toToken=I.toToken,N.toTokenAmount=I.toTokenAmount,N.toTokenPriceInUSD=I.toTokenPriceInUSD,N.networkPrice=I.networkPrice,N.networkTokenSymbol=I.networkTokenSymbol,N.networkBalanceInUSD=I.networkBalanceInUSD,N.inputError=I.inputError},resetValues(){let{networkAddress:e}=W.getParams(),t=N.tokens?.find(t=>t.address===e);W.setSourceToken(t),W.setToToken(void 0)},getApprovalLoadingState:()=>N.loadingApprovalTransaction,clearError(){N.transactionError=void 0},async initializeState(){if(!N.initializing){if(N.initializing=!0,!N.initialized)try{await W.fetchTokens(),N.initialized=!0}catch(e){N.initialized=!1,w.SnackController.showError("Failed to initialize swap"),u.RouterController.goBack()}N.initializing=!1}},async fetchTokens(){let{networkAddress:e}=W.getParams();await W.getNetworkTokenPrice(),await W.getMyTokensWithBalance();let t=N.myTokensWithBalance?.find(t=>t.address===e);t&&(N.networkTokenSymbol=t.symbol,W.setSourceToken(t),W.setSourceTokenAmount("0"))},async getTokenList(){let e=s.ChainController.state.activeCaipNetwork?.caipNetworkId;if(N.caipNetworkId!==e||!N.tokens)try{N.tokensLoading=!0;let t=await S.SwapApiUtil.getTokenList(e);N.tokens=t,N.caipNetworkId=e,N.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:+(e.symbol>t.symbol));let o=(e&&x.ConstantsUtil.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e),r=(x.ConstantsUtil.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e).filter(e=>!o.some(t=>t.address===e.address));N.suggestedTokens=[...o,...r]}catch(e){N.tokens=[],N.popularTokens=[],N.suggestedTokens=[]}finally{N.tokensLoading=!1}},async getAddressPrice(e){let t=N.tokensPriceMap[e];if(t)return t;let o=await E.BlockchainApiController.fetchTokenPrice({addresses:[e]}),r=o?.fungibles||[],i=[...N.tokens||[],...N.myTokensWithBalance||[]],a=i?.find(t=>t.address===e)?.symbol,n=parseFloat((r.find(e=>e.symbol.toLowerCase()===a?.toLowerCase())?.price||0).toString());return N.tokensPriceMap[e]=n,n},async getNetworkTokenPrice(){let{networkAddress:e}=W.getParams(),t=await E.BlockchainApiController.fetchTokenPrice({addresses:[e]}).catch(()=>(w.SnackController.showError("Failed to fetch network token price"),{fungibles:[]})),o=t.fungibles?.[0],r=o?.price.toString()||"0";N.tokensPriceMap[e]=parseFloat(r),N.networkTokenSymbol=o?.symbol||"",N.networkPrice=r},async getMyTokensWithBalance(e){let t=await k.BalanceUtil.getMyTokensWithBalance(e),o=S.SwapApiUtil.mapBalancesToSwapTokens(t);o&&(await W.getInitialGasPrice(),W.setBalances(o))},setBalances(e){let{networkAddress:t}=W.getParams(),o=s.ChainController.state.activeCaipNetwork;if(!o)return;let r=e.find(e=>e.address===t);e.forEach(e=>{N.tokensPriceMap[e.address]=e.price||0}),N.myTokensWithBalance=e.filter(e=>e.address.startsWith(o.caipNetworkId)),N.networkBalanceInUSD=r?v.NumberUtil.multiply(r.quantity.numeric,r.price).toString():"0"},async getInitialGasPrice(){let e=await S.SwapApiUtil.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(s.ChainController.state?.activeCaipNetwork?.chainNamespace){case y.ConstantsUtil.CHAIN.SOLANA:return N.gasFee=e.standard??"0",N.gasPriceInUSD=v.NumberUtil.multiply(e.standard,N.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(N.gasFee),gasPriceInUSD:Number(N.gasPriceInUSD)};case y.ConstantsUtil.CHAIN.EVM:default:let t=e.standard??"0",o=BigInt(t),r=BigInt(15e4),i=A.getGasPriceInUSD(N.networkPrice,r,o);return N.gasFee=t,N.gasPriceInUSD=i,{gasPrice:o,gasPriceInUSD:i}}},async swapTokens(){let e=s.ChainController.getAccountData()?.address,t=N.sourceToken,o=N.toToken,r=v.NumberUtil.bigNumber(N.sourceTokenAmount).gt(0);if(r||W.setToTokenAmount(""),!o||!t||N.loadingPrices||!r||!e)return;N.loadingQuote=!0;let i=v.NumberUtil.bigNumber(N.sourceTokenAmount).times(10**t.decimals).round(0);try{let r=await E.BlockchainApiController.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:N.gasFee,amount:i.toString()});N.loadingQuote=!1;let a=r?.quotes?.[0]?.toAmount;if(!a)return void P.AlertController.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");let n=v.NumberUtil.bigNumber(a).div(10**o.decimals).toString();W.setToTokenAmount(n),W.hasInsufficientToken(N.sourceTokenAmount,t.address)?N.inputError="Insufficient balance":(N.inputError=void 0,W.setTransactionDetails())}catch(t){let e=await S.SwapApiUtil.handleSwapError(t);N.loadingQuote=!1,N.inputError=e||"Insufficient balance"}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=W.getParams(),o=N.sourceToken,r=N.toToken;if(e&&t&&o&&r&&!N.loadingQuote)try{let t;return N.loadingBuildTransaction=!0,t=await S.SwapApiUtil.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:N.sourceTokenAmount,sourceTokenDecimals:o.decimals})?await W.createSwapTransaction():await W.createAllowanceTransaction(),N.loadingBuildTransaction=!1,N.fetchError=!1,t}catch(e){u.RouterController.goBack(),w.SnackController.showError("Failed to check allowance"),N.loadingBuildTransaction=!1,N.approvalTransaction=void 0,N.swapTransaction=void 0,N.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=W.getParams();if(e&&o){if(!t)throw Error("createAllowanceTransaction - No source token address found.");try{let r=await E.BlockchainApiController.generateApproveCalldata({from:t,to:o,userAddress:e}),i=T.CoreHelperUtil.getPlainAddress(r.tx.from);if(!i)throw Error("SwapController:createAllowanceTransaction - address is required");let a={data:r.tx.data,to:i,gasPrice:BigInt(r.tx.eip155.gasPrice),value:BigInt(r.tx.value),toAmount:N.toTokenAmount};return N.swapTransaction=void 0,N.approvalTransaction={data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount},{data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount}}catch(e){u.RouterController.goBack(),w.SnackController.showError("Failed to create approval transaction"),N.approvalTransaction=void 0,N.swapTransaction=void 0,N.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=W.getParams(),r=N.sourceToken,i=N.toToken;if(!t||!o||!r||!i)return;let a=d.ConnectionController.parseUnits(o,r.decimals)?.toString();try{let o=await E.BlockchainApiController.generateSwapCalldata({userAddress:t,from:r.address,to:i.address,amount:a,disableEstimate:!0}),n=r.address===e,s=BigInt(o.tx.eip155.gas),l=BigInt(o.tx.eip155.gasPrice),c=T.CoreHelperUtil.getPlainAddress(o.tx.to);if(!c)throw Error("SwapController:createSwapTransaction - address is required");let d={data:o.tx.data,to:c,gas:s,gasPrice:l,value:n?BigInt(a??"0"):BigInt("0"),toAmount:N.toTokenAmount};return N.gasPriceInUSD=A.getGasPriceInUSD(N.networkPrice,s,l),N.approvalTransaction=void 0,N.swapTransaction=d,d}catch(e){u.RouterController.goBack(),w.SnackController.showError("Failed to create transaction"),N.approvalTransaction=void 0,N.swapTransaction=void 0,N.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){w.SnackController.showLoading("Approve limit increase in your wallet"),u.RouterController.replace("SwapPreview")},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:o}=W.getParams();N.loadingApprovalTransaction=!0,o?u.RouterController.pushTransactionStack({onSuccess:W.onEmbeddedWalletApprovalSuccess}):w.SnackController.showLoading("Approve limit increase in your wallet");try{await d.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:y.ConstantsUtil.CHAIN.EVM}),await W.swapTokens(),await W.getTransaction(),N.approvalTransaction=void 0,N.loadingApprovalTransaction=!1}catch(e){N.transactionError=e?.displayMessage,N.loadingApprovalTransaction=!1,w.SnackController.showError(e?.displayMessage||"Transaction error"),R.EventsController.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:s.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:W.state.sourceToken?.symbol||"",swapToToken:W.state.toToken?.symbol||"",swapFromAmount:W.state.sourceTokenAmount||"",swapToAmount:W.state.toTokenAmount||"",isSmartAccount:(0,C.getPreferredAccountType)(y.ConstantsUtil.CHAIN.EVM)===b.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:o,isAuthConnector:r}=W.getParams();N.loadingTransaction=!0;let i=`Swapping ${N.sourceToken?.symbol} to ${v.NumberUtil.formatNumberToLocalString(o,3)} ${N.toToken?.symbol}`,a=`Swapped ${N.sourceToken?.symbol} to ${v.NumberUtil.formatNumberToLocalString(o,3)} ${N.toToken?.symbol}`;r?u.RouterController.pushTransactionStack({onSuccess(){u.RouterController.replace("Account"),w.SnackController.showLoading(i),O.resetState()}}):w.SnackController.showLoading("Confirm transaction in your wallet");try{let o=[N.sourceToken?.address,N.toToken?.address].join(","),i=await d.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:y.ConstantsUtil.CHAIN.EVM});return N.loadingTransaction=!1,w.SnackController.showSuccess(a),R.EventsController.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:s.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:W.state.sourceToken?.symbol||"",swapToToken:W.state.toToken?.symbol||"",swapFromAmount:W.state.sourceTokenAmount||"",swapToAmount:W.state.toTokenAmount||"",isSmartAccount:(0,C.getPreferredAccountType)(y.ConstantsUtil.CHAIN.EVM)===b.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),O.resetState(),r||u.RouterController.replace("Account"),O.getMyTokensWithBalance(o),i}catch(e){N.transactionError=e?.displayMessage,N.loadingTransaction=!1,w.SnackController.showError(e?.displayMessage||"Transaction error"),R.EventsController.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:s.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:W.state.sourceToken?.symbol||"",swapToToken:W.state.toToken?.symbol||"",swapFromAmount:W.state.sourceTokenAmount||"",swapToAmount:W.state.toTokenAmount||"",isSmartAccount:(0,C.getPreferredAccountType)(y.ConstantsUtil.CHAIN.EVM)===b.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken:(e,t)=>A.isInsufficientSourceTokenForSwap(e,t,N.myTokensWithBalance),setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=W.getParams();e&&t&&(N.gasPriceInUSD=A.getGasPriceInUSD(N.networkPrice,BigInt(N.gasFee),BigInt(15e4)),N.priceImpact=A.getPriceImpact({sourceTokenAmount:N.sourceTokenAmount,sourceTokenPriceInUSD:N.sourceTokenPriceInUSD,toTokenPriceInUSD:N.toTokenPriceInUSD,toTokenAmount:N.toTokenAmount}),N.maxSlippage=A.getMaxSlippage(N.slippage,N.toTokenAmount),N.providerFee=A.getProviderFee(N.sourceTokenAmount))}},W=(0,$.withErrorBoundary)(O);var U=e.i(639403);e.i(404041);var D=e.i(112699),z=e.i(645975),B=e.i(459088),F=e.i(162611),L=t;let j=F.css`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e["8"]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    overflow: hidden;
  }
`,M=class extends L.LitElement{render(){return o.html`<slot></slot>`}};M.styles=[B.resetStyles,j],M=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.customElement)("wui-card")],M),e.i(62238);var H=t,V=t;e.i(852634),e.i(839009),e.i(73944);let _=F.css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e["2"]};
    background-color: var(--local-icon-bg-value);
  }
`;var K=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let G={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"},Y=class extends V.LitElement{constructor(){super(...arguments),this.message="",this.type="info"}render(){return o.html`
      <wui-flex
        data-type=${(0,a.ifDefined)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${G[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){P.AlertController.close()}};Y.styles=[B.resetStyles,_],K([(0,r.property)()],Y.prototype,"message",void 0),K([(0,r.property)()],Y.prototype,"type",void 0),Y=K([(0,z.customElement)("wui-alertbar")],Y);let X=F.css`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e["3"]};
    left: ${({spacing:e})=>e["4"]};
    right: ${({spacing:e})=>e["4"]};
    opacity: 0;
    pointer-events: none;
  }
`;var q=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let Q={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}},Z=class extends H.LitElement{constructor(){super(),this.unsubscribe=[],this.open=P.AlertController.state.open,this.onOpen(!0),this.unsubscribe.push(P.AlertController.subscribeKey("open",e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=P.AlertController.state,r=Q[t];return o.html`
      <wui-alertbar
        message=${e}
        backgroundColor=${r?.backgroundColor}
        iconColor=${r?.iconColor}
        icon=${r?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};Z.styles=X,q([(0,i.state)()],Z.prototype,"open",void 0),Z=q([(0,z.customElement)("w3m-alertbar")],Z);var J=t,ee=e.i(241845),et=e.i(436220),eo=t;let er=F.css`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var ei=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ea=class extends eo.LitElement{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return o.html`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,a.ifDefined)(this.iconSize)}></wui-icon>
    </button>`}};ea.styles=[B.resetStyles,B.elementStyles,er],ei([(0,r.property)()],ea.prototype,"icon",void 0),ei([(0,r.property)()],ea.prototype,"variant",void 0),ei([(0,r.property)()],ea.prototype,"type",void 0),ei([(0,r.property)()],ea.prototype,"size",void 0),ei([(0,r.property)()],ea.prototype,"iconSize",void 0),ei([(0,r.property)({type:Boolean})],ea.prototype,"fullWidth",void 0),ei([(0,r.property)({type:Boolean})],ea.prototype,"disabled",void 0),ea=ei([(0,z.customElement)("wui-icon-button")],ea);var en=t;e.i(864380);let es=F.css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var el=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ec={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},ed={lg:"lg",md:"md",sm:"sm"},eu=class extends en.LitElement{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return o.html`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){let e=ec[this.size];return this.text?o.html`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return o.html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;let e=ed[this.size];return o.html` <wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};eu.styles=[B.resetStyles,B.elementStyles,es],el([(0,r.property)()],eu.prototype,"imageSrc",void 0),el([(0,r.property)()],eu.prototype,"text",void 0),el([(0,r.property)()],eu.prototype,"size",void 0),el([(0,r.property)()],eu.prototype,"type",void 0),el([(0,r.property)({type:Boolean})],eu.prototype,"disabled",void 0),eu=el([(0,z.customElement)("wui-select")],eu),e.i(630352),e.i(249536);var ep=e.i(542904);let em=F.css`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var eh=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ew=["SmartSessionList"],eg={PayWithExchange:F.vars.tokens.theme.foregroundPrimary};function ef(){let e=u.RouterController.state.data?.connector?.name,t=u.RouterController.state.data?.wallet?.name,o=u.RouterController.state.data?.network?.name,r=t??e,i=l.ConnectorController.getConnectors(),a=1===i.length&&i[0]?.id==="w3m-email",n=s.ChainController.getAccountData()?.socialProvider;return{Connect:`Connect ${a?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",UsageExceeded:"Usage Exceeded",ConnectingExternal:r??"Connect Wallet",ConnectingWalletConnect:r??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:r?`Get ${r}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:o??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:n?n.charAt(0).toUpperCase()+n.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in Progress",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset"}}let ev=class extends J.LitElement{constructor(){super(),this.unsubscribe=[],this.heading=ef()[u.RouterController.state.view],this.network=s.ChainController.state.activeCaipNetwork,this.networkImage=et.AssetUtil.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=u.RouterController.state.view,this.viewDirection="",this.unsubscribe.push(ee.AssetController.subscribeNetworkImages(()=>{this.networkImage=et.AssetUtil.getNetworkImage(this.network)}),u.RouterController.subscribeKey("view",e=>{setTimeout(()=>{this.view=e,this.heading=ef()[e]},ep.ConstantsUtil.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),s.ChainController.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=et.AssetUtil.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=eg[u.RouterController.state.view]??F.vars.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",e),o.html`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){R.EventsController.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),u.RouterController.push("WhatIsAWallet")}async onClose(){await m.safeClose()}rightHeaderTemplate(){let e=h.OptionsController?.state?.features?.smartSessions;return"Account"===u.RouterController.state.view&&e?o.html`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>u.RouterController.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return o.html`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){let e=ew.includes(this.view);return o.html`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?o.html`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:e}=u.RouterController.state,t="Connect"===e,r=h.OptionsController.state.enableEmbedded,i=h.OptionsController.state.enableNetworkSwitch;return"Account"===e&&i?o.html`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,a.ifDefined)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,a.ifDefined)(this.networkImage)}
      ></wui-select>`:this.showBack&&!("ApproveTransaction"===e||"ConnectingSiwe"===e||t&&r)?o.html`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:o.html`<wui-icon-button
      data-hidden=${!t}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(R.EventsController.sendEvent({type:"track",event:"CLICK_NETWORKS"}),u.RouterController.push("Networks"))}isAllowedNetworkSwitch(){let e=s.ChainController.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,o=e?.find(({id:e})=>e===this.network?.id);return t||!o}onViewChange(){let{history:e}=u.RouterController.state,t=ep.ConstantsUtil.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=ep.ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){let{history:e}=u.RouterController.state,t=this.shadowRoot?.querySelector("#dynamic");e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){u.RouterController.goBack()}};ev.styles=em,eh([(0,i.state)()],ev.prototype,"heading",void 0),eh([(0,i.state)()],ev.prototype,"network",void 0),eh([(0,i.state)()],ev.prototype,"networkImage",void 0),eh([(0,i.state)()],ev.prototype,"showBack",void 0),eh([(0,i.state)()],ev.prototype,"prevHistoryLength",void 0),eh([(0,i.state)()],ev.prototype,"view",void 0),eh([(0,i.state)()],ev.prototype,"viewDirection",void 0),ev=eh([(0,z.customElement)("w3m-header")],ev);var ey=t,eb=t;e.i(383227),e.i(912190);let ek=F.css`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`;var eC=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ex=class extends eb.LitElement{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return o.html`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return"loading"===this.variant?o.html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:o.html`<wui-icon-box
      size="md"
      color=${({success:"success",error:"error",warning:"warning",info:"default"})[this.variant]}
      icon=${({success:"checkmark",error:"warning",warning:"warningCircle",info:"info"})[this.variant]}
    ></wui-icon-box>`}};ex.styles=[B.resetStyles,ek],eC([(0,r.property)()],ex.prototype,"message",void 0),eC([(0,r.property)()],ex.prototype,"variant",void 0),ex=eC([(0,z.customElement)("wui-snackbar")],ex);var eT=e.i(592057);let eS=eT.css`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var eA=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let e$=class extends ey.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=w.SnackController.state.open,this.unsubscribe.push(w.SnackController.subscribeKey("open",e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=w.SnackController.state;return o.html` <wui-snackbar message=${e} variant=${t}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),w.SnackController.state.autoClose&&(this.timeout=setTimeout(()=>w.SnackController.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};e$.styles=eS,eA([(0,i.state)()],e$.prototype,"open",void 0),e$=eA([(0,z.customElement)("w3m-snackbar")],e$);var eP=t;let eE=(0,g.proxy)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),eR=(0,$.withErrorBoundary)({state:eE,subscribe:e=>(0,g.subscribe)(eE,()=>e(eE)),subscribeKey:(e,t)=>(0,f.subscribeKey)(eE,e,t),showTooltip({message:e,triggerRect:t,variant:o}){eE.open=!0,eE.message=e,eE.triggerRect=t,eE.variant=o},hide(){eE.open=!1,eE.message="",eE.triggerRect={width:0,height:0,top:0,left:0}}});e.i(443452);let eI=F.css`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e["3"]} 10px ${({spacing:e})=>e["3"]};
    border-radius: ${({borderRadius:e})=>e["3"]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e["5"]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var eN=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eO=class extends eP.LitElement{constructor(){super(),this.unsubscribe=[],this.open=eR.state.open,this.message=eR.state.message,this.triggerRect=eR.state.triggerRect,this.variant=eR.state.variant,this.unsubscribe.push(eR.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,o.html`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};eO.styles=[eI],eN([(0,i.state)()],eO.prototype,"open",void 0),eN([(0,i.state)()],eO.prototype,"message",void 0),eN([(0,i.state)()],eO.prototype,"triggerRect",void 0),eN([(0,i.state)()],eO.prototype,"variant",void 0),eO=eN([(0,z.customElement)("w3m-tooltip")],eO);let eW={getTabsByNamespace:e=>e&&e===y.ConstantsUtil.CHAIN.EVM?h.OptionsController.state.remoteFeatures?.activity===!1?ep.ConstantsUtil.ACCOUNT_TABS.filter(e=>"Activity"!==e.label):ep.ConstantsUtil.ACCOUNT_TABS:[],isValidReownName:e=>/^[a-zA-Z0-9]+$/gu.test(e),isValidEmail:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e),validateReownName:e=>e.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,""),hasFooter(){let e=u.RouterController.state.view;if(ep.ConstantsUtil.VIEWS_WITH_LEGAL_FOOTER.includes(e)){let{termsConditionsUrl:e,privacyPolicyUrl:t}=h.OptionsController.state,o=h.OptionsController.state.features?.legalCheckbox;return(!!e||!!t)&&!o}return ep.ConstantsUtil.VIEWS_WITH_DEFAULT_FOOTER.includes(e)}};var eU=t,eD=t;e.i(803596);let ez=F.css`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e["3"]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`;var eB=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eF=class extends eD.LitElement{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=h.OptionsController.state.remoteFeatures,this.unsubscribe.push(h.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=h.OptionsController.state,r=h.OptionsController.state.features?.legalCheckbox;return(e||t)&&!r?o.html`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `:o.html`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `}andTemplate(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=h.OptionsController.state;return e&&t?"and":""}termsTemplate(){let{termsConditionsUrl:e}=h.OptionsController.state;return e?o.html`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:e}=h.OptionsController.state;return e?o.html`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?o.html`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:o.html`<wui-ux-by-reown></wui-ux-by-reown>`:null}};eF.styles=[ez],eB([(0,i.state)()],eF.prototype,"remoteFeatures",void 0),eF=eB([(0,z.customElement)("w3m-legal-footer")],eF);var eL=t;e.i(210380);let ej=eT.css``,eM=class extends eL.LitElement{render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=h.OptionsController.state;return e||t?o.html`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return o.html` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){R.EventsController.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,C.getPreferredAccountType)(s.ChainController.state.activeChain)===b.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.RouterController.push("WhatIsABuy")}};eM.styles=[ej],eM=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.customElement)("w3m-onramp-providers-footer")],eM);let eH=F.css`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var eV=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let e_=class extends eU.LitElement{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=u.RouterController.state.view}firstUpdated(){this.status=eW.hasFooter()?"show":"hide",this.unsubscribe.push(u.RouterController.subscribeKey("view",e=>{this.view=e,this.status=eW.hasFooter()?"show":"hide","hide"===this.status&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=`${t.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return o.html`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return eW.hasFooter()?o.html` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return o.html`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return o.html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return o.html` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){R.EventsController.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),u.RouterController.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};e_.styles=[eH],eV([(0,i.state)()],e_.prototype,"status",void 0),eV([(0,i.state)()],e_.prototype,"view",void 0),e_=eV([(0,z.customElement)("w3m-footer")],e_);var eK=t;let eG=F.css`
  :host {
    display: block;
    width: inherit;
  }
`;var eY=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eX=class extends eK.LitElement{constructor(){super(),this.unsubscribe=[],this.viewState=u.RouterController.state.view,this.history=u.RouterController.state.history.join(","),this.unsubscribe.push(u.RouterController.subscribeKey("view",()=>{this.history=u.RouterController.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return o.html`${this.templatePageContainer()}`}templatePageContainer(){return o.html`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=u.RouterController.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case"AccountSettings":return o.html`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return o.html`<w3m-account-view></w3m-account-view>`;case"AllWallets":return o.html`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return o.html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return o.html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return o.html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return o.html`<w3m-connect-view></w3m-connect-view>`;case"Create":return o.html`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return o.html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return o.html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return o.html`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return o.html`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return o.html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return o.html`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return o.html`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return o.html`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return o.html`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return o.html`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return o.html`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return o.html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return o.html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return o.html`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return o.html`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return o.html`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return o.html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return o.html`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return o.html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return o.html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return o.html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return o.html`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return o.html`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return o.html`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return o.html`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return o.html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return o.html`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return o.html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return o.html`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return o.html`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return o.html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return o.html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return o.html`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return o.html`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return o.html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return o.html`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return o.html`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return o.html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return o.html`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return o.html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return o.html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return o.html`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return o.html`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return o.html`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return o.html`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return o.html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return o.html`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return o.html`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"FundWallet":return o.html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return o.html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return o.html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case"UsageExceeded":return o.html`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`}}};eX.styles=[eG],eY([(0,i.state)()],eX.prototype,"viewState",void 0),eY([(0,i.state)()],eX.prototype,"history",void 0),eX=eY([(0,z.customElement)("w3m-router")],eX);let eq=F.css`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`;var eQ=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eZ="scroll-lock",eJ={PayWithExchange:"0",PayWithExchangeSelectAsset:"0"};class e0 extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=h.OptionsController.state.enableEmbedded,this.open=c.ModalController.state.open,this.caipAddress=s.ChainController.state.activeCaipAddress,this.caipNetwork=s.ChainController.state.activeCaipNetwork,this.shake=c.ModalController.state.shake,this.filterByNamespace=l.ConnectorController.state.filterByNamespace,this.padding=F.vars.spacing[1],this.mobileFullScreen=h.OptionsController.state.enableMobileFullScreen,this.initializeTheming(),n.ApiController.prefetchAnalyticsConfig(),this.unsubscribe.push(c.ModalController.subscribeKey("open",e=>e?this.onOpen():this.onClose()),c.ModalController.subscribeKey("shake",e=>this.shake=e),s.ChainController.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),s.ChainController.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),h.OptionsController.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e),l.ConnectorController.subscribeKey("filterByNamespace",e=>{this.filterByNamespace===e||s.ChainController.getAccountData(e)?.caipAddress||(n.ApiController.fetchRecommendedWallets(),this.filterByNamespace=e)}),u.RouterController.subscribeKey("view",()=>{this.dataset.border=eW.hasFooter()?"true":"false",this.padding=eJ[u.RouterController.state.view]??F.vars.spacing[1]}))}firstUpdated(){if(this.dataset.border=eW.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded){c.ModalController.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return(this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded)?o.html`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?o.html`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return o.html` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,a.ifDefined)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){e.target===e.currentTarget&&(this.mobileFullScreen||await this.handleClose())}async handleClose(){await m.safeClose()}initializeTheming(){let{themeVariables:e,themeMode:t}=U.ThemeController.state,o=D.UiHelperUtil.getColorTheme(t);(0,B.initializeTheming)(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),w.SnackController.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let e=document.createElement("style");e.dataset.w3m=eZ,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){let e=document.head.querySelector(`style[data-w3m="${eZ}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",t=>{if("Escape"===t.key)this.handleClose();else if("Tab"===t.key){let{tagName:o}=t.target;!o||o.includes("W3M-")||o.includes("WUI-")||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){let t=s.ChainController.state.isSwitchingNamespace,o="ProfileWallets"===u.RouterController.state.view;e||t||o||c.ModalController.close(),await p.SIWXUtil.initializeIfEnabled(e),this.caipAddress=e,s.ChainController.setIsSwitchingNamespace(!1)}onNewNetwork(e){let t=this.caipNetwork,o=t?.caipNetworkId?.toString(),r=e?.caipNetworkId?.toString(),i="UnsupportedChain"===u.RouterController.state.view,a=c.ModalController.state.open,n=!1;this.enableEmbedded&&"SwitchNetwork"===u.RouterController.state.view&&(n=!0),o!==r&&W.resetState(),a&&i&&(n=!0),n&&"SIWXSignMessage"!==u.RouterController.state.view&&u.RouterController.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(n.ApiController.prefetch(),n.ApiController.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}e0.styles=eq,eQ([(0,r.property)({type:Boolean})],e0.prototype,"enableEmbedded",void 0),eQ([(0,i.state)()],e0.prototype,"open",void 0),eQ([(0,i.state)()],e0.prototype,"caipAddress",void 0),eQ([(0,i.state)()],e0.prototype,"caipNetwork",void 0),eQ([(0,i.state)()],e0.prototype,"shake",void 0),eQ([(0,i.state)()],e0.prototype,"filterByNamespace",void 0),eQ([(0,i.state)()],e0.prototype,"padding",void 0),eQ([(0,i.state)()],e0.prototype,"mobileFullScreen",void 0);let e3=class extends e0{};e3=eQ([(0,z.customElement)("w3m-modal")],e3);let e1=class extends e0{};e1=eQ([(0,z.customElement)("appkit-modal")],e1),e.s(["AppKitModal",()=>e1,"W3mModal",()=>e3,"W3mModalBase",()=>e0],839010);var e2=t;e.i(534420);let e5=F.css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:e})=>e[5]};
    background-color: ${({colors:e})=>e.semanticError010};
  }
`,e4=class extends e2.LitElement{constructor(){super()}render(){return o.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){u.RouterController.goBack()}};e4.styles=e5,e4=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.customElement)("w3m-usage-exceeded-view")],e4),e.s(["W3mUsageExceededView",()=>e4],871886);var e8=t;e.i(987789);let e6=F.css`
  :host {
    width: 100%;
  }
`;var e9=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let e7=class extends e8.LitElement{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has("name")||e.has("imageSrc")||e.has("walletRank"))&&(this.hasImpressionSent=!1),e.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&R.EventsController.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:u.RouterController.state.view,displayIndex:this.displayIndex}))}render(){return o.html`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,a.ifDefined)(this.imageSrc)}
        name=${this.name}
        size=${(0,a.ifDefined)(this.size)}
        tagLabel=${(0,a.ifDefined)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};e7.styles=e6,e9([(0,r.property)({type:Array})],e7.prototype,"walletImages",void 0),e9([(0,r.property)()],e7.prototype,"imageSrc",void 0),e9([(0,r.property)()],e7.prototype,"name",void 0),e9([(0,r.property)()],e7.prototype,"size",void 0),e9([(0,r.property)()],e7.prototype,"tagLabel",void 0),e9([(0,r.property)()],e7.prototype,"tagVariant",void 0),e9([(0,r.property)()],e7.prototype,"walletIcon",void 0),e9([(0,r.property)()],e7.prototype,"tabIdx",void 0),e9([(0,r.property)({type:Boolean})],e7.prototype,"disabled",void 0),e9([(0,r.property)({type:Boolean})],e7.prototype,"showAllWallets",void 0),e9([(0,r.property)({type:Boolean})],e7.prototype,"loading",void 0),e9([(0,r.property)({type:String})],e7.prototype,"loadingSpinnerColor",void 0),e9([(0,r.property)()],e7.prototype,"rdnsId",void 0),e9([(0,r.property)()],e7.prototype,"displayIndex",void 0),e9([(0,r.property)()],e7.prototype,"walletRank",void 0),e7=e9([(0,z.customElement)("w3m-list-wallet")],e7),e.s(["W3mListWallet",()=>e7],530520);var te=t;let tt=F.css`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var to=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let tr=class extends te.LitElement{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=h.OptionsController.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has("history")){let e=this.history;""!==this.historyState&&this.historyState!==e&&this.onViewChange(e)}e.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),e.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=t.contentRect.height,o=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");this.mobileFullScreen?(e=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-o,this.style.setProperty("--local-border-bottom-radius","0px")):(e+=o,this.style.setProperty("--local-border-bottom-radius",o?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${e}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${e}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){let e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return o.html`
      <div class="container" data-mobile-fullscreen="${(0,a.ifDefined)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,a.ifDefined)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){let t=e.split(",").filter(Boolean),o=this.historyState.split(",").filter(Boolean),r=o.length,i=t.length,a=t[t.length-1]||"",n=D.UiHelperUtil.cssDurationToNumber(this.transitionDuration),s="";i>r?s="next":i<r?s="prev":i===r&&t[i-1]!==o[r-1]&&(s="next"),this.viewDirection=`${s}-${a}`,setTimeout(()=>{this.historyState=e,this.setView?.(a)},n),setTimeout(()=>{this.viewDirection=""},2*n)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){let e=this.getWrapper();if(!e)return;let t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0"),o=0;this.mobileFullScreen?(o=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-t,this.style.setProperty("--local-border-bottom-radius","0px")):(o=e.getBoundingClientRect().height+t,this.style.setProperty("--local-border-bottom-radius",t?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${o}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${o}px`}getHeaderHeight(){return 60}};tr.styles=[tt],to([(0,r.property)({type:String})],tr.prototype,"transitionDuration",void 0),to([(0,r.property)({type:String})],tr.prototype,"transitionFunction",void 0),to([(0,r.property)({type:String})],tr.prototype,"history",void 0),to([(0,r.property)({type:String})],tr.prototype,"view",void 0),to([(0,r.property)({attribute:!1})],tr.prototype,"setView",void 0),to([(0,i.state)()],tr.prototype,"viewDirection",void 0),to([(0,i.state)()],tr.prototype,"historyState",void 0),to([(0,i.state)()],tr.prototype,"previousHeight",void 0),to([(0,i.state)()],tr.prototype,"mobileFullScreen",void 0),tr=to([(0,z.customElement)("w3m-router-container")],tr),e.s(["W3mRouterContainer",()=>tr],595604),e.s([],334570),e.i(334570),e.i(839010),e.i(871886),e.i(530520),e.i(595604),e.s(["AppKitModal",()=>e1,"W3mListWallet",()=>e7,"W3mModal",()=>e3,"W3mModalBase",()=>e0,"W3mRouterContainer",()=>tr,"W3mUsageExceededView",()=>e4],271502)}]);