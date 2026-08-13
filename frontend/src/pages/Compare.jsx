import { useEffect, useMemo, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import MainLayout from "../layouts/MainLayout";
import { getAllCourses } from "../services/courseService";
import {
  getAllComparisons,
  createComparison,
  updateComparison,
  deleteComparison,
} from "../services/comparisonService";
import { useObject } from "@ai-sdk/react";
import { z } from "zod";
import "./Compare.css";

const CompareSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().optional(),
      provider: z.string().optional(),
      price: z.string().optional(),
      duration: z.string().optional(),
      format: z.string().optional(),
      tech_stack: z.array(z.string()).optional(),
      target: z.string().optional(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
    })
  ).optional(),
  verdict: z.string().optional(),
});

const MOCK_AI_DATA = {
  items: [
    {
      name: "Coursera Introduction to AI",
      provider: "Coursera / Stanford",
      price: "$49 / tháng",
      duration: "4 tuần (3-5h/tuần)",
      format: "Online (Self-paced)",
      tech_stack: ["Python", "TensorFlow", "Scikit-Learn"],
      target: "Người mới bắt đầu, sinh viên CNTT",
      pros: ["Chứng chỉ uy tín toàn cầu", "Giảng viên top đầu thế giới", "Lý thuyết nền tảng vững chắc"],
      cons: ["Thiếu sự hỗ trợ 1-1 trực tiếp", "Tiếng Anh là ngôn ngữ chính"],
    },
    {
      name: "TECHCOOL Nhập môn AI",
      provider: "TECHCOOL Academy",
      price: "4.500.000 VNĐ",
      duration: "2 tháng (Hybrid/Offline)",
      format: "Hybrid (Online + Mentoring)",
      tech_stack: ["Python", "PyTorch", "OpenCV", "GenAI SDK"],
      target: "Lập trình viên, người đi làm chuyển ngành",
      pros: ["Mentor hướng dẫn 1-1 tại Việt Nam", "Dự án thực tế doanh nghiệp", "Hỗ trợ kết nối việc làm"],
      cons: ["Chi phí cao hơn học online thuần túy", "Lịch học cố định theo tuần"],
    },
  ],
  verdict: "Nếu bạn muốn tự học lý thuyết chuẩn quốc tế với chi phí tối ưu, chọn Coursera. Nếu bạn cần mentor cầm tay chỉ việc, làm dự án thực tế và tìm việc tại Việt Nam, TECHCOOL là lựa chọn phù hợp hơn.",
};

const metricRows = [
  { label: "Khoảng giá", key: "price", icon: "payments" },
  { label: "Thời lượng", key: "duration", icon: "schedule" },
  { label: "Hình thức học", key: "format", icon: "laptop_mac" },
  { label: "Công cụ & Công nghệ", key: "tools", icon: "build" },
  { label: "Đối tượng học viên", key: "audience", icon: "groups" },
  { label: "Điểm mạnh", key: "strengths", icon: "thumb_up" },
  { label: "Hạn chế", key: "weaknesses", icon: "thumb_down" },
];

const accentClasses = ["primary", "blue", "gold", "rose", "teal", "slate"];

const normalizeCourse = (course, index = 0) => {
  const toolCombo = Array.isArray(course.toolCombo) ? course.toolCombo : [];
  const strengths = Array.isArray(course.strengths) ? course.strengths : [];
  const weaknesses = Array.isArray(course.weaknesses) ? course.weaknesses : [];

  let price = "Liên hệ";
  if (course.feeDisplay) {
    price = course.feeDisplay;
  } else if (course.minFee !== undefined || course.maxFee !== undefined) {
    const min = course.minFee ?? 0;
    const max = course.maxFee ?? min;
    price = min === max ? `$${min}` : `$${min} - $${max}`;
  }

  const providerName =
    typeof course.provider === "object"
      ? course.provider?.name
      : course.provider || "Chưa rõ đơn vị";

  return {
    id: course.id,
    provider: providerName,
    courseName: course.title || "Khóa học chưa có tên",
    price,
    duration: course.durationDisplay || "Chưa rõ",
    format: course.learningFormat || "Trực tuyến",
    tools: toolCombo.length ? toolCombo : ["Cơ bản"],
    audience:
      Array.isArray(course.targetAudience) && course.targetAudience.length
        ? course.targetAudience.join(", ")
        : course.targetAudience || "Người học chung",
    strengths: strengths.length ? strengths : ["Giá trị học tập tốt"],
    weaknesses: weaknesses.length ? weaknesses : ["Cần thêm chi tiết"],
    accent: accentClasses[index % accentClasses.length],
    source: course.sourceUrl || "#",
  };
};

function Compare() {
  const matrixRef = useRef(null);
  const aiResultRef = useRef(null);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [selectedComparisonId, setSelectedComparisonId] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI Streaming States
  const [mockAiData, setMockAiData] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false);

  // Modals & Confirmations
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ show: false, id: null, title: "" });
  const [confirmRemoveModal, setConfirmRemoveModal] = useState({ show: false, courseId: null, courseName: "" });
  const [editTitleModal, setEditTitleModal] = useState({ show: false, id: null, title: "" });
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [addCourseSearch, setAddCourseSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [pendingExportTitle, setPendingExportTitle] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  const { object: aiObject, submit: submitAi, isLoading: isAiLoading } = useObject({
    api: "http://localhost:5000/api/compare",
    schema: CompareSchema,
    onError: (err) => {
      console.error("AI Streaming error:", err);
      showToast("Lỗi kết nối Gemini API. Tải dữ liệu mẫu (Fallback).", "warning");
      setMockAiData(MOCK_AI_DATA);
    },
  });

  const handleRunAiComparison = (itemAOverride, itemBOverride) => {
    let itemA = typeof itemAOverride === "string" ? itemAOverride : null;
    let itemB = typeof itemBOverride === "string" ? itemBOverride : null;

    if (!itemA || !itemB) {
      if (selectedCourses.length >= 2) {
        itemA = `${selectedCourses[0].provider} - ${selectedCourses[0].courseName}`;
        itemB = `${selectedCourses[1].provider} - ${selectedCourses[1].courseName}`;
      } else if (selectedCourses.length === 1) {
        itemA = `${selectedCourses[0].provider} - ${selectedCourses[0].courseName}`;
        itemB = "Coursera Introduction to AI";
      } else {
        itemA = "Coursera Introduction to AI";
        itemB = "TECHCOOL Nhập môn AI";
      }
    }

    setMockAiData(null);
    setShowAiSection(true);
    showToast(`AI đang phân tích so sánh: "${itemA}" vs "${itemB}"...`, "info");

    submitAi({ itemA, itemB });

    setTimeout(() => {
      if (aiResultRef.current) {
        aiResultRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  const handleLoadMockAi = () => {
    setMockAiData(MOCK_AI_DATA);
    setShowAiSection(true);
    showToast("Đã tải dữ liệu so sánh mẫu!", "success");
    setTimeout(() => {
      if (aiResultRef.current) {
        aiResultRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const currentAiData = mockAiData || aiObject;

  const exportComparisonPdf = async (comparisonTitle) => {
    if (!selectedCourses.length) {
      showToast("Vui lòng chọn ít nhất 1 khóa học để xuất PDF.", "warning");
      return;
    }

    const title = comparisonTitle || "Bảng so sánh khóa học";

    try {
      if (!matrixRef.current) {
        showToast("Không thể xuất PDF lúc này, vui lòng thử lại.", "error");
        return;
      }

      showToast("Đang tạo PDF, vui lòng đợi...", "info");

      // Capture the comparison matrix table
      const canvas = await html2canvas(matrixRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 280; // A4 landscape width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(0, 61, 155);
      doc.text(title, margin, margin + 5);

      // Add image of the matrix table
      let yPosition = margin + 15;
      if (imgHeight > pageHeight - yPosition - margin) {
        // Handle multi-page PDFs if needed
        let remainingHeight = imgHeight;
        let currentPage = 1;
        let sourceY = 0;

        while (remainingHeight > 0) {
          const heightToPrint = Math.min(remainingHeight, pageHeight - yPosition - margin);
          const sourceHeight = (heightToPrint * canvas.height) / imgHeight;

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const ctx = tempCanvas.getContext("2d");
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const tempImgData = tempCanvas.toDataURL("image/png");

          if (currentPage > 1) {
            doc.addPage();
            yPosition = margin;
          }

          doc.addImage(tempImgData, "PNG", margin, yPosition, imgWidth, heightToPrint);
          yPosition += heightToPrint + margin;
          sourceY += sourceHeight;
          remainingHeight -= heightToPrint;
          currentPage++;
        }
      } else {
        doc.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      }

      const fileName = `${title.replace(/[^a-z0-9\s]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() || "comparison"}.pdf`;
      doc.save(fileName);
      showToast("Đã xuất PDF thành công!", "success");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showToast("Lỗi khi xuất PDF, vui lòng thử lại.", "error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, comparisonData] = await Promise.all([
          getAllCourses(),
          getAllComparisons(),
        ]);

        const normalizedCourses = Array.isArray(courseData)
          ? courseData.map((course, index) => normalizeCourse(course, index))
          : [];
        setCourses(normalizedCourses);

        const normalizedComparisons = Array.isArray(comparisonData)
          ? comparisonData.map((comparison, index) => {
              const comparisonCourses = Array.isArray(comparison.courseIds)
                ? comparison.courseIds
                    .map((courseId) => normalizedCourses.find((course) => course.id === courseId))
                    .filter(Boolean)
                : [];

              return {
                id: comparison.id,
                title: comparison.title || `So sánh ${index + 1}`,
                savedAt: comparison.createdAt
                  ? `Đã lưu: ${new Date(comparison.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}`
                  : "Đã lưu: Gần đây",
                count: comparisonCourses.length || comparison.courseIds?.length || 0,
                providers: comparisonCourses.map((course) => course.provider),
                courses: comparisonCourses,
                courseIds: comparison.courseIds || [],
              };
            })
          : [];

        setSavedComparisons(normalizedComparisons);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không thể tải dữ liệu so sánh.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-export when detail view loads
  useEffect(() => {
    if (selectedComparisonId && pendingExportTitle && matrixRef.current) {
      setTimeout(() => {
        exportComparisonPdf(pendingExportTitle);
        setPendingExportTitle(null);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComparisonId, pendingExportTitle]);

  const filteredComparisons = useMemo(() => {
    return savedComparisons.filter((item) => {
      const query = search.toLowerCase();
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.providers.some((provider) => provider.toLowerCase().includes(query)) ||
        item.savedAt.toLowerCase().includes(query)
      );
    });
  }, [savedComparisons, search]);

  const selectedComparison = savedComparisons.find((item) => item.id === selectedComparisonId) || null;

  const availableCourses = useMemo(() => {
    return courses.filter((course) => !selectedCourses.some((item) => item.id === course.id));
  }, [courses, selectedCourses]);

  const filteredAvailableCourses = useMemo(() => {
    if (!addCourseSearch.trim()) return availableCourses;
    const q = addCourseSearch.toLowerCase();
    return availableCourses.filter(
      (c) => c.courseName.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q)
    );
  }, [availableCourses, addCourseSearch]);

  const openComparison = (comparison) => {
    setSelectedComparisonId(comparison.id);
    setSelectedCourses(comparison.courses);
  };

  const createNewComparison = () => {
    setSelectedComparisonId("draft");
    setSelectedCourses([]); // Bỏ khóa học default khi thêm so sánh mới
  };

  const handleAddCourseFromModal = (course) => {
    setSelectedCourses((prev) => [...prev, course]);
    setAddCourseModal(false);
    setAddCourseSearch("");
    showToast(`Đã thêm "${course.courseName}" vào bảng so sánh.`, "success");
  };

  const triggerRemoveCourse = (course) => {
    setConfirmRemoveModal({ show: true, courseId: course.id, courseName: course.courseName });
  };

  const confirmRemoveCourse = () => {
    if (confirmRemoveModal.courseId) {
      setSelectedCourses((prev) => prev.filter((c) => c.id !== confirmRemoveModal.courseId));
      showToast("Đã xóa khóa học khỏi bảng so sánh.", "info");
    }
    setConfirmRemoveModal({ show: false, courseId: null, courseName: "" });
  };

  const triggerDeleteComparison = (item) => {
    setConfirmDeleteModal({ show: true, id: item.id, title: item.title });
  };

  const confirmDeleteComparison = async () => {
    const { id } = confirmDeleteModal;
    if (!id) return;

    try {
      await deleteComparison(id);
      setSavedComparisons((prev) => prev.filter((item) => item.id !== id));
      if (selectedComparisonId === id) {
        setSelectedComparisonId(null);
        setSelectedCourses([]);
      }
      showToast("Đã xóa bảng so sánh.", "success");
    } catch (err) {
      setError(err.message || "Không thể xóa bảng so sánh.");
    } finally {
      setConfirmDeleteModal({ show: false, id: null, title: "" });
    }
  };

  const triggerEditTitle = (item) => {
    setEditTitleModal({ show: true, id: item.id, title: item.title });
  };

  const confirmEditTitle = async () => {
    const { id, title } = editTitleModal;
    if (!id || !title.trim()) return;

    try {
      await updateComparison(id, { title: title.trim() });
      setSavedComparisons((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: title.trim() } : item))
      );
      showToast("Đã cập nhật tên bảng so sánh.", "success");
    } catch (err) {
      setError(err.message || "Không thể cập nhật tên.");
    } finally {
      setEditTitleModal({ show: false, id: null, title: "" });
    }
  };

  const saveComparison = async () => {
    if (selectedCourses.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 khóa học để lưu.", "warning");
      return;
    }

    try {
      const defaultTitle = selectedComparison?.title || `So sánh ${new Date().toLocaleDateString("vi-VN")}`;
      const payload = {
        title: defaultTitle,
        courseIds: selectedCourses.map((course) => course.id),
      };

      if (selectedComparisonId && selectedComparisonId !== "draft") {
        await updateComparison(selectedComparisonId, payload);
        setSavedComparisons((prev) =>
          prev.map((item) =>
            item.id === selectedComparisonId
              ? {
                  ...item,
                  courses: selectedCourses,
                  count: selectedCourses.length,
                  providers: selectedCourses.map((c) => c.provider),
                  courseIds: payload.courseIds,
                }
              : item
          )
        );
      } else {
        const created = await createComparison(payload);
        const savedCourseList = selectedCourses.map((course) => ({ ...course }));
        const nextItem = {
          id: created.id,
          title: defaultTitle,
          savedAt: `Đã lưu: ${new Date().toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`,
          count: savedCourseList.length,
          providers: savedCourseList.map((course) => course.provider),
          courses: savedCourseList,
          courseIds: payload.courseIds,
        };

        setSavedComparisons((prev) => [nextItem, ...prev]);
        setSelectedComparisonId(created.id);
      }

      showToast("Đã lưu bảng so sánh thành công!", "success");
      setError("");
    } catch (err) {
      setError(err.message || "Không thể lưu bảng so sánh.");
    }
  };

  const renderMetricCell = (course, key) => {
    if (key === "tools") {
      return (
        <div className="compare-metric-tags">
          {course.tools.map((tool) => (
            <span key={`${course.id}-${tool}`} className="compare-tag">
              {tool}
            </span>
          ))}
        </div>
      );
    }

    if (key === "strengths" || key === "weaknesses") {
      return (
        <ul className={`compare-list ${key === "strengths" ? "is-success" : "is-muted"}`}>
          {(course[key] || []).map((item) => (
            <li key={`${course.id}-${item}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return <span className="compare-text">{course[key]}</span>;
  };

  const colCount = selectedCourses.length + 1;

  return (
    <MainLayout>
      <div className="compare-page">
        {toast.show && (
          <div className={`compare-toast ${toast.type}`}>
            <span className="material-symbols-outlined">
              {toast.type === "success" ? "check_circle" : toast.type === "warning" ? "warning" : "info"}
            </span>
            {toast.message}
          </div>
        )}

        {error && (
          <div className="compare-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!selectedComparisonId ? (
          <div className="compare-landing">
            <div className="compare-landing-header">
              <div className="compare-heading-wrap">
                <h1 className="compare-page-title">So sánh khóa học</h1>
              </div>

              <button className="compare-primary-btn" onClick={createNewComparison}>
                <span className="material-symbols-outlined">add</span>
                Tạo so sánh mới
              </button>
            </div>

            <div className="compare-toolbar">
              <div className="compare-search-wrap">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, đơn vị đào tạo, từ khóa..."
                />
              </div>

              <div className="compare-inline-filters">
                <div className="compare-select-wrap">
                  <span className="material-symbols-outlined">calendar_month</span>
                  <select defaultValue="all">
                    <option value="all">Tất cả thời gian</option>
                    <option value="30">30 ngày gần đây</option>
                    <option value="90">90 ngày gần đây</option>
                    <option value="year">Năm nay</option>
                  </select>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>

                <button className="compare-secondary-btn">
                  <span className="material-symbols-outlined">filter_list</span>
                  Bộ lọc
                </button>
              </div>
            </div>

            {loading ? (
              <div className="compare-empty-state">Đang tải dữ liệu so sánh...</div>
            ) : (
              <div className="compare-card-grid">
                {filteredComparisons.map((item) => (
                  <div key={item.id} className="compare-card">
                    <div className="compare-card-actions">
                      <button
                        className="compare-icon-button"
                        title="Đổi tên"
                        onClick={() => triggerEditTitle(item)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        className="compare-icon-button danger"
                        title="Xóa"
                        onClick={() => triggerDeleteComparison(item)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>

                    <div className="compare-card-body">
                      <div className="compare-card-badges">
                        <span className="compare-badge compare-badge-date">{item.savedAt}</span>
                        <span className="compare-badge compare-badge-count">
                          {item.count} Khóa học
                        </span>
                      </div>

                      <h3>{item.title}</h3>

                      <div className="compare-provider-rows">
                        <p className="compare-provider-label">Đơn vị đào tạo</p>
                        <div className="compare-provider-list">
                          {item.providers.slice(0, 3).map((provider, i) => (
                            <span key={`${item.id}-${provider}-${i}`} className="compare-provider-pill">
                              <i className="compare-dot" />
                              {provider}
                            </span>
                          ))}
                          {item.providers.length > 3 && (
                            <span className="compare-provider-pill muted">
                              +{item.providers.length - 3} khác
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="compare-card-footer">
                      <div className="compare-card-more-actions">
                        <button
                          className="compare-square-button"
                          title="Xuất PDF"
                          onClick={() => {
                            setSelectedComparisonId(item.id);
                            setSelectedCourses(item.courses);
                            setPendingExportTitle(item.title);
                          }}
                        >
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </button>
                      </div>

                      <button className="compare-view-button" onClick={() => openComparison(item)}>
                        Xem chi tiết
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button className="compare-empty-card" onClick={createNewComparison}>
                  <div className="compare-empty-icon">
                    <span className="material-symbols-outlined">add_box</span>
                  </div>
                  <h4>Tạo so sánh mới</h4>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="compare-detail">
            <div className="compare-detail-header">
              <div className="compare-detail-header-left">
                <button
                  className="compare-back-btn"
                  onClick={() => {
                    setSelectedComparisonId(null);
                    setSelectedCourses([]);
                  }}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>

                <div>
                  <div className="compare-detail-kicker">
                    <span className="material-symbols-outlined">rule_folder</span>
                    PHÂN TÍCH SO SÁNH
                  </div>
                  <h1>{selectedComparison?.title || "Tạo so sánh mới"}</h1>
                </div>
              </div>

              <div className="compare-detail-actions">
                <button className="compare-detail-secondary" onClick={saveComparison}>
                  <span className="material-symbols-outlined">bookmark_add</span>
                  Lưu bảng so sánh
                </button>

                <button
                  className="compare-detail-ai-btn"
                  onClick={() => handleRunAiComparison()}
                  disabled={isAiLoading}
                  title="Chạy AI so sánh tự động"
                >
                  <span className="material-symbols-outlined animated-sparkle">auto_awesome</span>
                  {isAiLoading ? "AI đang phân tích..." : "Phân tích bằng AI"}
                </button>

                <button
                  className="compare-detail-primary"
                  onClick={() => exportComparisonPdf(selectedComparison?.title || "Bảng so sánh khóa học")}
                >
                  <span className="material-symbols-outlined">download</span>
                  Xuất báo cáo
                </button>
              </div>
            </div>

            <div className="compare-table-wrap">
              <div
                ref={matrixRef}
                className="compare-matrix"
                style={{ "--col-count": colCount }}
              >
                {/* Header Row */}
                <div className="compare-matrix-row header-row">
                  <div className="compare-metric-label-cell header">
                    <span className="material-symbols-outlined">analytics</span>
                    <span>Tiêu chí so sánh</span>
                  </div>

                  {selectedCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`compare-course-header-cell ${course.accent || "primary"}`}
                    >
                      <div className="compare-course-top-row">
                        <span className="compare-provider-pill small">{course.provider}</span>
                        <button
                          className="compare-close-button"
                          title="Bỏ khóa học"
                          onClick={() => triggerRemoveCourse(course)}
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                      <h3>{course.courseName}</h3>
                      {course.source && course.source !== "#" && (
                        <a
                          href={course.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="compare-link"
                        >
                          Xem nguồn
                          <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                      )}
                    </div>
                  ))}

                  <div
                    className="compare-add-header-cell"
                    onClick={() => setAddCourseModal(true)}
                  >
                    <div className="compare-add-box">
                      <div className="compare-add-icon">
                        <span className="material-symbols-outlined">add</span>
                      </div>
                      <span>Thêm khóa học</span>
                    </div>
                  </div>
                </div>

                {/* Metric Rows */}
                {metricRows.map((row, rIdx) => (
                  <div
                    key={row.key}
                    className={`compare-matrix-row ${rIdx % 2 === 0 ? "even" : "odd"}`}
                  >
                    <div className="compare-metric-label-cell">
                      <span className="material-symbols-outlined compare-row-icon">
                        {row.icon}
                      </span>
                      <span>{row.label}</span>
                    </div>

                    {selectedCourses.map((course) => (
                      <div
                        key={`${course.id}-${row.key}`}
                        className={`compare-metric-data-cell ${course.accent || "primary"}`}
                      >
                        {renderMetricCell(course, row.key)}
                      </div>
                    ))}

                    <div
                      className="compare-metric-empty-cell"
                      onClick={() => setAddCourseModal(true)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── BLOCK KẾT QUẢ AI STREAMING ── */}
            {showAiSection && (
              <div className="compare-ai-container" ref={aiResultRef}>
                <div className="compare-ai-header">
                  <div className="compare-ai-title-wrap">
                    <div className="compare-ai-sparkle-badge">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                      <h2>Kết quả phân tích bởi AI Agent</h2>
                    </div>
                  </div>
                </div>

                {isAiLoading && (
                  <div className="compare-ai-loading">
                    <div className="ai-pulse-spinner"></div>
                    <span>Gemini AI đang tổng hợp thông tin và stream dữ liệu real-time...</span>
                  </div>
                )}

                {currentAiData?.items && currentAiData.items.length > 0 && (
                  <div className="compare-ai-grid">
                    {currentAiData.items.map((item, idx) => (
                      <div key={idx} className="compare-ai-card">
                        <div className="compare-ai-card-header">
                          <span className="compare-ai-provider-tag">{item.provider || "Đơn vị đào tạo"}</span>
                          <h3>{item.name || `Khóa học ${idx + 1}`}</h3>
                        </div>

                        <div className="compare-ai-card-body">
                          <div className="compare-ai-field-row">
                            <span className="material-symbols-outlined field-icon">payments</span>
                            <span className="field-title">Học phí:</span>
                            <span className="field-val highlight">{item.price || "Chưa cập nhật"}</span>
                          </div>
                          <div className="compare-ai-field-row">
                            <span className="material-symbols-outlined field-icon">schedule</span>
                            <span className="field-title">Thời lượng:</span>
                            <span className="field-val">{item.duration || "Chưa cập nhật"}</span>
                          </div>
                          <div className="compare-ai-field-row">
                            <span className="material-symbols-outlined field-icon">laptop_mac</span>
                            <span className="field-title">Hình thức:</span>
                            <span className="field-val">{item.format || "Chưa cập nhật"}</span>
                          </div>

                          {item.tech_stack && item.tech_stack.length > 0 && (
                            <div className="compare-ai-field-block">
                              <span className="field-title">🛠️ Công nghệ / Công cụ:</span>
                              <div className="compare-ai-tech-pills">
                                {item.tech_stack.map((tech, i) => (
                                  <span key={i} className="ai-tech-pill">{tech}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.target && (
                            <div className="compare-ai-field-block">
                              <span className="field-title">🎯 Đối tượng phù hợp:</span>
                              <p className="field-desc">{item.target}</p>
                            </div>
                          )}

                          {item.pros && item.pros.length > 0 && (
                            <div className="compare-ai-field-block">
                              <span className="field-title pros">👍 Ưu điểm nổi bật:</span>
                              <ul className="ai-list pros-list">
                                {item.pros.map((pro, i) => (
                                  <li key={i}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.cons && item.cons.length > 0 && (
                            <div className="compare-ai-field-block">
                              <span className="field-title cons">👎 Điểm cần lưu ý:</span>
                              <ul className="ai-list cons-list">
                                {item.cons.map((con, i) => (
                                  <li key={i}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentAiData?.verdict && (
                  <div className="compare-ai-verdict">
                    <div className="verdict-header">
                      <span className="material-symbols-outlined verdict-icon">verified</span>
                      <h4>Đánh giá chung:</h4>
                    </div>
                    <p className="verdict-text">{currentAiData.verdict}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MODALS ── */}

        {/* Modal Confirm Delete */}
        {confirmDeleteModal.show && (
          <div className="compare-modal-overlay" onClick={() => setConfirmDeleteModal({ show: false, id: null, title: "" })}>
            <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="compare-modal-header danger">
                <span className="material-symbols-outlined">warning</span>
                <h3>Xác nhận xóa bảng so sánh</h3>
              </div>
              <div className="compare-modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa bảng so sánh <strong>"{confirmDeleteModal.title}"</strong>?
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="compare-modal-footer">
                <button
                  className="compare-secondary-btn"
                  onClick={() => setConfirmDeleteModal({ show: false, id: null, title: "" })}
                >
                  Hủy
                </button>
                <button className="compare-danger-btn" onClick={confirmDeleteComparison}>
                  Xóa bảng so sánh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirm Remove Course */}
        {confirmRemoveModal.show && (
          <div className="compare-modal-overlay" onClick={() => setConfirmRemoveModal({ show: false, courseId: null, courseName: "" })}>
            <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="compare-modal-header warning">
                <span className="material-symbols-outlined">help_outline</span>
                <h3>Bỏ khóa học khỏi so sánh</h3>
              </div>
              <div className="compare-modal-body">
                <p>
                  Bạn có chắc chắn muốn bỏ khóa học <strong>"{confirmRemoveModal.courseName}"</strong> khỏi bảng so sánh này?
                </p>
              </div>
              <div className="compare-modal-footer">
                <button
                  className="compare-secondary-btn"
                  onClick={() => setConfirmRemoveModal({ show: false, courseId: null, courseName: "" })}
                >
                  Hủy
                </button>
                <button className="compare-danger-btn" onClick={confirmRemoveCourse}>
                  Bỏ khóa học
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Edit Title */}
        {editTitleModal.show && (
          <div className="compare-modal-overlay" onClick={() => setEditTitleModal({ show: false, id: null, title: "" })}>
            <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="compare-modal-header">
                <span className="material-symbols-outlined">edit</span>
                <h3>Đổi tên bảng so sánh</h3>
              </div>
              <div className="compare-modal-body">
                <label className="compare-input-label">Tên bảng so sánh</label>
                <input
                  type="text"
                  className="compare-modal-input"
                  value={editTitleModal.title}
                  onChange={(e) => setEditTitleModal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tên mới..."
                  autoFocus
                />
              </div>
              <div className="compare-modal-footer">
                <button
                  className="compare-secondary-btn"
                  onClick={() => setEditTitleModal({ show: false, id: null, title: "" })}
                >
                  Hủy
                </button>
                <button className="compare-primary-btn" onClick={confirmEditTitle}>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Add Course Selector */}
        {addCourseModal && (
          <div className="compare-modal-overlay" onClick={() => setAddCourseModal(false)}>
            <div className="compare-modal-card wide" onClick={(e) => e.stopPropagation()}>
              <div className="compare-modal-header">
                <span className="material-symbols-outlined">add_circle</span>
                <h3>Chọn khóa học để so sánh</h3>
              </div>
              <div className="compare-modal-body">
                <div className="compare-search-wrap modal-search">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    type="text"
                    value={addCourseSearch}
                    onChange={(e) => setAddCourseSearch(e.target.value)}
                    placeholder="Tìm theo tên khóa học, đơn vị đào tạo..."
                  />
                </div>

                <div className="compare-modal-course-list">
                  {filteredAvailableCourses.length === 0 ? (
                    <div className="compare-modal-empty">
                      Khái niệm / Từ khóa tìm kiếm không khớp hoặc đã chọn hết khóa học.
                    </div>
                  ) : (
                    filteredAvailableCourses.map((c) => (
                      <div key={c.id} className="compare-modal-course-item">
                        <div className="compare-modal-course-info">
                          <span className="compare-provider-pill small">{c.provider}</span>
                          <h4>{c.courseName}</h4>
                          <div className="compare-modal-course-meta">
                            <span>{c.price}</span> • <span>{c.duration}</span> • <span>{c.format}</span>
                          </div>
                        </div>
                        <button
                          className="compare-primary-btn small"
                          onClick={() => handleAddCourseFromModal(c)}
                        >
                          <span className="material-symbols-outlined">add</span>
                          Chọn
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="compare-modal-footer">
                <button className="compare-secondary-btn" onClick={() => setAddCourseModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Compare;