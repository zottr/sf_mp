import { Button, Typography, useTheme } from '@mui/material';
import QuantityButton from './QuantityButton';
import { useContext } from 'react';
import CartContext from '../../context/CartContext';
import LoadingButton from '../../components/shared/LoadingButton';

function AddToCartButton({
  productVariantId,
  adminId,
  adminName,
  buttonTextVariant,
  buttonHeight,
  setSelectedProduct,
}) {
  const theme = useTheme();
  let buttonSx = {
    height: buttonHeight,
  };
  const {
    activeOrder,
    addItemToCart,
    modifyItemQtyInCart,
    removeItemFromCart,
    itemBeingModifiedId,
    itemBeingAddedVariantId,
  } = useContext(CartContext);

  const isItemBeingAdded = itemBeingAddedVariantId === productVariantId;

  let quantity = 0;
  const productInCart = activeOrder?.lines?.find(
    (orderLine) => orderLine.productVariant.id === productVariantId
  );

  if (productInCart != null) {
    quantity = productInCart.quantity;
  }

  const handleAdd = () => {
    if (typeof setSelectedProduct === 'function') {
      setSelectedProduct({
        productVariantId: productVariantId,
        adminId: adminId,
        adminName: adminName,
      });
    }
    addItemToCart(productVariantId, adminId, false);
  };

  const handleModifyAdd = () => {
    quantity = quantity + 1;
    modifyItemQtyInCart(productInCart?.id, quantity);
  };

  const handleModifyMinus = () => {
    quantity = quantity - 1;
    modifyItemQtyInCart(productInCart?.id, quantity);
    // if (quantity > 1) {
    //   quantity = quantity - 1;
    //   modifyItemQtyInCart(productInCart?.id, quantity);
    // } else {
    //   quantity = 0;
    //   removeItemFromCart(productInCart?.id);
    // }
  };

  return (
    <>
      {quantity > 0 && (
        <QuantityButton
          quantity={quantity}
          addToCart={handleModifyAdd}
          removeFromCart={handleModifyMinus}
          buttonHeight={buttonHeight}
          buttonSize="medium"
          labelVariant="button1"
          itemBeingModifiedId={itemBeingModifiedId}
          itemId={productInCart?.id}
        />
      )}
      {quantity === 0 && (
        <>
          {/* <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              ...buttonSx,
              width: '100%',
              // backgroundColor: 'hsl(84, 100%, 60%)',
              bgcolor: 'primary.light',
              '&:hover, &:focus, &:active': {
                bgcolor: 'primary.light',
              },
              color: theme.palette.grey[900],
              borderColor: 'primary.light',
              borderRadius: '25px',
            }}
          >
            <Typography variant={buttonTextVariant}>Add to cart</Typography>
          </Button> */}
          <LoadingButton
            onClick={handleAdd}
            loading={isItemBeingAdded}
            variant="contained"
            type="button"
            buttonStyles={{
              backgroundColor: 'primary.light',
              borderRadius: '25px',
            }}
            buttonContainerStyles={{
              ...buttonSx,
              width: '100%',
            }}
            label="Add to cart"
            labelStyles={{
              color: 'grey.900',
            }}
            labelVariant={buttonTextVariant}
            progressSize={24}
            progressThickness={7}
            progressStyles={{
              color: 'grey.700',
            }}
          />
        </>
      )}
    </>
  );
}

export default AddToCartButton;
