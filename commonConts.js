const CONSTS = {};

CONSTS.PRODUCT_STATUS = {
  Awaiting_Approval: 0,
  Active: 1,
  InActive: 2,
};

CONSTS.ORDER_STATUS = {
  Processing: 0,
  Recieved: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 4,
  Return: 5,
};

module.exports = CONSTS;
