import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import uniswapNftAirdropClaim from 'abis/uniswap-nft-airdrop-claim.json'
import airdropBackgroundv2 from 'assets/images/airdopBackground.png'
import { ButtonEmphasis, ButtonSize, ThemeButton } from 'components/Button'
import { OpacityHoverState } from 'components/Common'
import Loader from 'components/Loader'
import { UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS } from 'constants/addresses'
import { useContract } from 'hooks/useContract'
import { ChevronRightIcon } from 'nft/components/icons'
import { useIsClaimAvailable } from 'nft/hooks/useClaimsAvailable'
import { CollectionRewardsFetcher, Rewards, RewardType } from 'nft/queries/genie/GetAirdorpMerkle'
import { useEffect, useState } from 'react'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import styled from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'

import Modal from '../Modal'

const ModalWrap = styled.div`
  display: flex;
  flex-direction: column;
`

const Body = styled.div`
  padding: 28px 20px 20px 20px;
`

const ClaimButton = styled(ThemeButton)`
  width: 100%;
  background-color: ${({ theme }) => theme.accentAction};
  margin-top: 40px;
  border-radius: 12px;
  color: ${({ theme }) => theme.white};
`

const Line = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.white};
  opacity: 0.24;
  margin-top: 12px;
  margin-bottom: 12px;
`

const LinkWrap = styled.a`
  text-decoration: none;
  ${OpacityHoverState}
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
`

const StyledImage = styled.img`
  width: 100%;
  height: 170px;
`

const USDCLabel = styled.div`
  font-weight: 700;
  font-size: 36px;
  line-height: 44px;
  margin-top: 8px;
  color: white;
`

const TextContainer = styled.div`
  position: absolute;
  left: 16px;
  top: 16px;
  right: 16px;
`

const RewardsDetailsContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const CurrencyText = styled.span`
  color: white;
  font-weight: 500;
  font-size: 12px;
  line-height: 14.5px;
`

const ClaimContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 380px;
  padding: 60px 28px;
  padding-bottom: 20px;
`

const SuccessText = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-top: 24px;
  margin-bottom: 8px;
`

const EtherscanLink = styled.a`
  text-decoration: none;

  ${OpacityHoverState}
`

const CloseButton = styled(ThemeButton)`
  max-width: 68px;
  margin-top: auto;
  margin-left: auto;
  margin-right: auto;
`

const SyledCloseIcon = styled(CloseIcon)`
  float: right;
  height: 24px;

  ${OpacityHoverState}
`

const RewardsText = styled.span`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.white};

  &:first-child {
    margin-bottom: 8px;
  }
`

const RewardsInformationText = styled.span`
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.textPrimary};
  margin-bottom: 28px;
`

const MainHeader = styled.span`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: ${({ theme }) => theme.white};
`

const AirdropModal = () => {
  const { account, provider } = useWeb3React()
  const [claim, setClaim] = useState<Rewards>()
  const [isClaimed, setIsClaimed] = useState(true)
  const setIsClaimAvailable = useIsClaimAvailable((state) => state.setIsClaimAvailable)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(300)
  const isOpen = useModalIsOpen(ApplicationModal.UNISWAP_NFT_AIRDROP_CLAIM)
  const usdcAirdropToggle = useToggleModal(ApplicationModal.UNISWAP_NFT_AIRDROP_CLAIM)
  const contract = useContract(UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS, uniswapNftAirdropClaim)

  useEffect(() => {
    if (account && provider && contract) {
      ;(async () => {
        const { data } = await CollectionRewardsFetcher(account)
        const claim = data.find((claim) => claim?.rewardType === RewardType.GENIE_UNISWAP_USDC_AIRDROP)

        if (!claim) return

        const [isClaimed] = await contract.connect(provider).functions.isClaimed(claim?.index)

        if (claim && isClaimed === false) {
          const usdAmount = BigNumber.from(claim.amount).div(10 ** 6)
          setClaim(claim)
          setTotalAmount(usdAmount.toNumber())
          setIsClaimAvailable(true)
          setIsClaimed(isClaimed)
        }
      })()
    }
  }, [account, contract, provider, setIsClaimAvailable])

  const makeClaim = async () => {
    try {
      if (contract && claim && claim.amount && claim.merkleProof && provider) {
        setIsSubmitting(true)
        await contract.connect(provider?.getSigner()).functions.claim(claim?.amount, claim?.merkleProof)
        setIsSubmitting(false)
      }
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  const dismiss = () => {
    usdcAirdropToggle()
  }

  return (
    <Modal hideBorder isOpen={isOpen} onDismiss={dismiss} maxHeight={90} maxWidth={400}>
      <ModalWrap>
        {isClaimed ? (
          <ClaimContainer>
            <ThemedText.HeadlineSmall>Congratulations!</ThemedText.HeadlineSmall>
            <SuccessText>
              You have successfully claimed {totalAmount} USDC. Thank you for supporting Genie.xyz.
            </SuccessText>
            <EtherscanLink href="https://etherscan.io/" target="_blank">
              <ThemedText.Link>
                <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: 8 }}>Etherscan</span>
                  <ChevronRightIcon />
                </div>
              </ThemedText.Link>
            </EtherscanLink>

            <CloseButton size={ButtonSize.medium} emphasis={ButtonEmphasis.medium} onClick={dismiss}>
              Close
            </CloseButton>
          </ClaimContainer>
        ) : (
          <>
            <ImageContainer>
              <TextContainer>
                <SyledCloseIcon onClick={dismiss} stroke="white" />
                <MainHeader>Uniswap NFT Airdrop</MainHeader>
                <USDCLabel>{totalAmount} USDC</USDCLabel>
                <Line />
                <RewardsDetailsContainer>
                  <RewardsText>Trading rewards</RewardsText> <CurrencyText>300 USDC</CurrencyText>
                </RewardsDetailsContainer>
                <RewardsDetailsContainer>
                  <RewardsText>Genie NFT holder rewards</RewardsText> <CurrencyText>0</CurrencyText>
                </RewardsDetailsContainer>
              </TextContainer>
              <StyledImage src={airdropBackgroundv2} />
            </ImageContainer>
            <Body>
              <RewardsInformationText>
                As a long time supporter of Genie, you’ve been awarded {totalAmount} USDC tokens. Read more about
                Uniswap NFT.
              </RewardsInformationText>
              <LinkWrap href="https://uniswap.org/blog/uniswap-nft-aggregator-announcement" target="_blank">
                <ThemedText.Link>Read more about Uniswap NFT.</ThemedText.Link>
              </LinkWrap>

              <ClaimButton
                onClick={makeClaim}
                size={ButtonSize.medium}
                emphasis={ButtonEmphasis.medium}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader stroke="white" />}
                <span>Claim{isSubmitting && 'ing'} USDC</span>
              </ClaimButton>
            </Body>
          </>
        )}
      </ModalWrap>
    </Modal>
  )
}

export default AirdropModal