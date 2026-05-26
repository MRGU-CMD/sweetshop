// Simplified China region data for address picker
export interface RegionItem {
  name: string;
  children?: RegionItem[];
}

export const regionData: RegionItem[] = [
  {
    name: "北京市", children: [
      { name: "东城区" }, { name: "西城区" }, { name: "朝阳区" }, { name: "丰台区" },
      { name: "石景山区" }, { name: "海淀区" }, { name: "顺义区" }, { name: "通州区" },
      { name: "大兴区" }, { name: "房山区" }, { name: "昌平区" }, { name: "怀柔区" },
      { name: "密云区" }, { name: "延庆区" }, { name: "平谷区" }, { name: "门头沟区" },
    ],
  },
  {
    name: "上海市", children: [
      { name: "黄浦区" }, { name: "徐汇区" }, { name: "长宁区" }, { name: "静安区" },
      { name: "普陀区" }, { name: "虹口区" }, { name: "杨浦区" }, { name: "浦东新区" },
      { name: "闵行区" }, { name: "宝山区" }, { name: "嘉定区" }, { name: "金山区" },
      { name: "松江区" }, { name: "青浦区" }, { name: "奉贤区" }, { name: "崇明区" },
    ],
  },
  {
    name: "广东省", children: [
      { name: "广州市", children: [{ name: "天河区" }, { name: "越秀区" }, { name: "海珠区" }, { name: "荔湾区" }, { name: "白云区" }, { name: "番禺区" }, { name: "黄埔区" }, { name: "花都区" }, { name: "南沙区" }, { name: "增城区" }, { name: "从化区" }] },
      { name: "深圳市", children: [{ name: "南山区" }, { name: "福田区" }, { name: "罗湖区" }, { name: "宝安区" }, { name: "龙岗区" }, { name: "龙华区" }, { name: "光明区" }, { name: "坪山区" }, { name: "盐田区" }] },
      { name: "东莞市" }, { name: "佛山市" }, { name: "珠海市" }, { name: "中山市" }, { name: "惠州市" }, { name: "汕头市" }, { name: "江门市" }, { name: "湛江市" }, { name: "肇庆市" },
    ],
  },
  {
    name: "浙江省", children: [
      { name: "杭州市", children: [{ name: "西湖区" }, { name: "拱墅区" }, { name: "滨江区" }, { name: "上城区" }, { name: "萧山区" }, { name: "余杭区" }, { name: "临平区" }, { name: "钱塘区" }, { name: "富阳区" }, { name: "临安区" }] },
      { name: "宁波市" }, { name: "温州市" }, { name: "嘉兴市" }, { name: "湖州市" }, { name: "绍兴市" }, { name: "金华市" }, { name: "台州市" },
    ],
  },
  {
    name: "江苏省", children: [
      { name: "南京市" }, { name: "苏州市" }, { name: "无锡市" }, { name: "常州市" }, { name: "南通市" }, { name: "徐州市" }, { name: "扬州市" }, { name: "镇江市" }, { name: "盐城市" },
    ],
  },
  {
    name: "四川省", children: [
      { name: "成都市", children: [{ name: "锦江区" }, { name: "青羊区" }, { name: "金牛区" }, { name: "武侯区" }, { name: "成华区" }, { name: "高新区" }, { name: "天府新区" }, { name: "龙泉驿区" }, { name: "双流区" }, { name: "温江区" }, { name: "郫都区" }, { name: "新都区" }] },
      { name: "绵阳市" }, { name: "德阳市" }, { name: "宜宾市" }, { name: "南充市" },
    ],
  },
  { name: "湖北省", children: [{ name: "武汉市" }, { name: "宜昌市" }, { name: "襄阳市" }, { name: "荆州市" }] },
  { name: "湖南省", children: [{ name: "长沙市" }, { name: "株洲市" }, { name: "湘潭市" }, { name: "衡阳市" }] },
  { name: "福建省", children: [{ name: "福州市" }, { name: "厦门市" }, { name: "泉州市" }, { name: "漳州市" }] },
  { name: "山东省", children: [{ name: "济南市" }, { name: "青岛市" }, { name: "烟台市" }, { name: "潍坊市" }] },
  { name: "河南省", children: [{ name: "郑州市" }, { name: "洛阳市" }, { name: "开封市" }, { name: "南阳市" }] },
  { name: "河北省", children: [{ name: "石家庄市" }, { name: "唐山市" }, { name: "保定市" }, { name: "邯郸市" }] },
  { name: "辽宁省", children: [{ name: "沈阳市" }, { name: "大连市" }] },
  { name: "陕西省", children: [{ name: "西安市" }, { name: "咸阳市" }] },
  { name: "重庆市", children: [{ name: "渝中区" }, { name: "江北区" }, { name: "渝北区" }, { name: "南岸区" }, { name: "沙坪坝区" }, { name: "九龙坡区" }, { name: "巴南区" }, { name: "北碚区" }, { name: "大渡口区" }] },
  { name: "天津市", children: [{ name: "和平区" }, { name: "河东区" }, { name: "河西区" }, { name: "南开区" }, { name: "河北区" }, { name: "红桥区" }, { name: "滨海新区" }, { name: "西青区" }, { name: "北辰区" }] },
  { name: "安徽省", children: [{ name: "合肥市" }, { name: "芜湖市" }, { name: "蚌埠市" }] },
  { name: "江西省", children: [{ name: "南昌市" }, { name: "九江市" }, { name: "景德镇市" }] },
  { name: "云南省", children: [{ name: "昆明市" }, { name: "大理市" }, { name: "丽江市" }] },
  { name: "贵州省", children: [{ name: "贵阳市" }, { name: "遵义市" }] },
  { name: "广西", children: [{ name: "南宁市" }, { name: "桂林市" }, { name: "柳州市" }] },
  { name: "海南省", children: [{ name: "海口市" }, { name: "三亚市" }] },
  { name: "黑龙江省", children: [{ name: "哈尔滨市" }, { name: "大庆市" }] },
  { name: "吉林省", children: [{ name: "长春市" }, { name: "吉林市" }] },
  { name: "山西省", children: [{ name: "太原市" }, { name: "大同市" }] },
  { name: "内蒙古", children: [{ name: "呼和浩特市" }, { name: "包头市" }] },
  { name: "甘肃省", children: [{ name: "兰州市" }, { name: "天水市" }] },
  { name: "青海省", children: [{ name: "西宁市" }] },
  { name: "宁夏", children: [{ name: "银川市" }] },
  { name: "新疆", children: [{ name: "乌鲁木齐市" }] },
  { name: "西藏", children: [{ name: "拉萨市" }] },
  { name: "香港" },
  { name: "澳门" },
  { name: "台湾省" },
];
