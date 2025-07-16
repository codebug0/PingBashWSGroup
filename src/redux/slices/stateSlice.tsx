import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EditProduct {
  product: string,
  price: number,
  image: string,
  id: Number
}


interface CounterState {
  isLoading: boolean;
  isExpanded: boolean;
  showFeedback: boolean;
  editProduct: EditProduct | null;
}

const initialState: CounterState = {
  isLoading: false,
  isExpanded: false,
  showFeedback: false,
  editProduct: null,
};


export const stateSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    setShowFeedback: (state, action: PayloadAction<boolean>) => {
      state.showFeedback = action.payload;
    },
    setEditProduct: (state, action: PayloadAction<EditProduct | null>) => {
      state.editProduct = action.payload
    }
  },
});

export const { setIsLoading, setIsExpanded, setShowFeedback, setEditProduct } = stateSlice.actions;

export default stateSlice.reducer;
