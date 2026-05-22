export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待付款", color: "text-orange-500" },
  PAID: { label: "已付款", color: "text-blue-500" },
  SHIPPED: { label: "运输中", color: "text-purple-500" },
  RECEIVED: { label: "已收货", color: "text-green-500" },
  COMPLETED: { label: "已完成", color: "text-gray-400" },
  CANCELLED: { label: "已取消", color: "text-gray-300" },
};

export const AFTER_SALE_STATUS_LABELS: Record<string, string> = {
  PENDING: "待处理",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  COMPLETED: "已完成",
};

export const AFTER_SALE_TYPE_LABELS: Record<string, string> = {
  RETURN: "退货退款",
  REFUND: "仅退款",
  EXCHANGE: "换货",
};
