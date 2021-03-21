import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get(`/products?id=${productId}`);
      const responseStock = await api.get(`/stock?id=${productId}`);

      const productExistingInCart = cart.find(
        (product) => product.id === productId
      );
      const QtdOfProductExistingInCart = productExistingInCart
        ? productExistingInCart.amount
        : 0;

      if (QtdOfProductExistingInCart < responseStock.data[0].amount) {
        let cartCopy: Product[] = [];

        if (productExistingInCart) {
          cartCopy = cart.map((item) => {
            if (item.id === productId) {
              return {
                ...item,
                amount: item.amount + 1,
              };
            }

            return item;
          });
        } else {
          cartCopy = [...cart, { ...response.data[0], amount: 1 }];
        }

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartCopy));
        setCart(cartCopy);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      console.log("atual", cart);
      const newCart = cart.filter((item) => item.id !== productId);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      setCart(newCart);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
