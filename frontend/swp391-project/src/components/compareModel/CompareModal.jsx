import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Empty,
  Rate,
  Image,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  CloseOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";
import ProductCard from "../product-card";
import { useTranslation } from "react-i18next";
import axios from "axios";
import config from "../../config/config";

const { Text } = Typography;

const CompareModal = ({ isVisible, onClose, initialFish, allFish }) => {
  const [comparedFishes, setComparedFishes] = useState([initialFish, null]);
  const [fishTypes, setFishTypes] = useState([]);
  const [isSelectModalVisible, setIsSelectModalVisible] = useState(false);
  const [selectIndex, setSelectIndex] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (initialFish) {
      setComparedFishes([initialFish, null]);
    }
  }, [initialFish]);

  useEffect(() => {
    const fetchFishTypes = async () => {
      try {
        const response = await axios.get(`${config.API_ROOT}fishtypes`);
        setFishTypes(response.data);
      } catch (error) {
        console.error("Error fetching fish types:", error);
      }
    };
    fetchFishTypes();
  }, []);

  const handleSelectFish = (fish) => {
    setComparedFishes((prev) => {
      const newFishes = [...prev];
      newFishes[selectIndex] = fish;
      return newFishes;
    });
    setIsSelectModalVisible(false);
  };

  const handleRemoveFish = (index) => {
    setComparedFishes((prev) => {
      const newFishes = [...prev];
      newFishes[index] = null;
      return newFishes;
    });
  };

  const availableFishes = useMemo(() => {
    const comparedFishIds = comparedFishes
      .filter((fish) => fish !== null)
      .map((fish) => fish.fishId);
    return initialFish
      ? allFish.filter(
          (fish) =>
            !comparedFishIds.includes(fish.fishId) &&
            fish.class === initialFish.class &&
            fish.fishTypeId === initialFish.fishTypeId
        )
      : [];
  }, [allFish, comparedFishes, initialFish]);

  const renderComparisonRow = (
    label,
    property,
    compare = null,
    formatValue = null,
    customRender = null
  ) => {
    if (property === "breed") {
      return (
        <Row
          className="comparison-row"
          gutter={16}
          style={{ marginBottom: 16, alignItems: "center" }}
          key={property}
        >
          <Col span={6}>
            <Text strong>{label}</Text>
          </Col>
          {comparedFishes.map((fish, index) => {
            const fishType = fish
              ? fishTypes.find((type) => type.fishTypeId === fish.fishTypeId)
              : null;
            const typeName = fishType ? fishType.name : "-";

            return (
              <Col span={9} key={index} className="comparison-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text>{typeName}</Text>
                </div>
              </Col>
            );
          })}
        </Row>
      );
    }

    const values = comparedFishes.map((fish) => (fish ? fish[property] : null));

    return (
      <Row
        className="comparison-row"
        gutter={16}
        style={{ marginBottom: 16, alignItems: "center" }}
        key={`${property}-${values.join("-")}`}
      >
        <Col span={6}>
          <Text strong>{label}</Text>
        </Col>
        {comparedFishes.map((fish, index) => (
          <Col span={9} key={index} className="comparison-item">
            <div style={{ display: "flex", alignItems: "center" }}>
              {customRender ? (
                customRender(fish ? fish[property] : null)
              ) : (
                <Text>
                  {fish
                    ? formatValue
                      ? formatValue(fish[property])
                      : fish[property]
                    : "-"}
                </Text>
              )}
              {compare && values[0] !== null && values[1] !== null && (
                <span className="comparison-icon">
                  {compare(values[index], values[1 - index])}
                </span>
              )}
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const compareNumeric = (a, b, higherIsBetter = true) => {
    if (a === b) return null;
    if (higherIsBetter ? a > b : a < b) {
      return <ArrowUpOutlined style={{ color: "green" }} />;
    } else {
      return <ArrowDownOutlined style={{ color: "red" }} />;
    }
  };

  const comparePrice = (a, b) => {
    const priceA = parseFloat(a);
    const priceB = parseFloat(b);
    if (isNaN(priceA) || isNaN(priceB)) return null;
    if (priceA === priceB) return null;
    return priceA > priceB ? (
      <ArrowUpOutlined style={{ color: "green" }} />
    ) : (
      <ArrowDownOutlined style={{ color: "red" }} />
    );
  };

  const compareOrigin = (a, b) => {
    const originRank = { Japan: 3, F1: 2, VietNam: 1 };
    const rankA = originRank[a] || 0;
    const rankB = originRank[b] || 0;

    if (rankA === rankB) return null;
    return rankA > rankB ? (
      <ArrowUpOutlined style={{ color: "green" }} />
    ) : (
      <ArrowDownOutlined style={{ color: "red" }} />
    );
  };

  const formatPrice = (price) => `${parseFloat(price).toLocaleString()} VND`;

  const renderRating = (rating) => {
    return rating !== null ? (
      <Rate disabled defaultValue={rating} allowHalf />
    ) : (
      "-"
    );
  };

  const formatGender = (gender) => {
    return gender === 0 ? t("male") : t("female");
  };

  return (
    <div className="compare-page">
      <Modal
        title={t("compareFishes")}
        visible={isVisible}
        onCancel={onClose}
        width={800}
        footer={null}
        style={{ borderRadius: "20px" }}
      >
        {comparedFishes.some((fish) => fish !== null) ? (
          <>
            <Row gutter={16}>
              {comparedFishes.map((fish, index) => (
                <Col span={12} key={index}>
                  {fish ? (
                    <Card
                      className="fish-card"
                      cover={
                        <div className="fish-card-cover">
                          <Image
                            alt={fish.name}
                            src={fish.imageUrl}
                            preview={{
                              maskClassName: "customize-mask",
                              mask: (
                                <ZoomInOutlined
                                  style={{ fontSize: "24px", color: "#fff" }}
                                />
                              ),
                            }}
                            style={{
                              width: "368px",
                              height: "500px",
                              objectFit: "cover", // Giữ tỷ lệ ảnh mà không bị cắt
                            }}
                          />
                        </div>
                      }
                      extra={
                        <Tooltip title={t("remove")}>
                          <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleRemoveFish(index)}
                            style={{
                              borderRadius: "50%",
                              backgroundColor: "#bbab6f",
                              color: "#fff",
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <Card.Meta
                        title={fish.name}
                        description={fish.description}
                        style={{ textAlign: "center" }}
                      />
                    </Card>
                  ) : (
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectIndex(index);
                        setIsSelectModalVisible(true);
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 200,
                      }}
                    >
                      {t("addFishToCompare")}
                    </Button>
                  )}
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 20 }}>
              {renderComparisonRow(t("Name"), "name")}
              {renderComparisonRow(t("Breed"), "breed")}
              {renderComparisonRow(t("Size"), "size", (a, b) =>
                compareNumeric(a, b)
              )}
              {renderComparisonRow(
                t("Price"),
                "price",
                comparePrice,
                formatPrice
              )}
              {renderComparisonRow(t("Class"), "class", compareOrigin)}
              {renderComparisonRow(
                t("Rating"),
                "rating",
                (a, b) => compareNumeric(a, b),
                null,
                renderRating
              )}
              {renderComparisonRow(t("Gender"), "gender", null, formatGender)}
              {renderComparisonRow(t("Age"), "age", (a, b) =>
                compareNumeric(a, b)
              )}
            </div>
          </>
        ) : (
          <Empty description={t("noFishSelectedForComparison")} />
        )}
      </Modal>

      <Modal
        title={t("selectFishToCompare")}
        visible={isSelectModalVisible}
        onCancel={() => setIsSelectModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          {availableFishes.map((fish) => (
            <Col span={8} key={fish.id}>
              <ProductCard
                fish={fish}
                onCompare={() => handleSelectFish(fish)}
              />
            </Col>
          ))}
        </Row>
        {availableFishes.length === 0 && (
          <Empty description={t("noMoreFishAvailableForComparison")} />
        )}
      </Modal>
    </div>
  );
};

export default CompareModal;
