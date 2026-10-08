import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const ManageAddonsTable = ({
  addons,
  isLoading,
  handleEditClick,
  handleDeleteClick,
}) => {
  return (
    <div className="menu-panel">
      {/* ───── Table ───── */}
      <div className="menu-table-wrapper">
        <table className="menu-table">
          <thead>
            <tr>
              <th style={{ width: "25%", textAlign: "left" }}>Name</th>
              <th style={{ width: "15%", textAlign: "left" }}>Price</th>
              <th style={{ width: "35%", textAlign: "left" }}>Applicable To</th>
              <th style={{ width: "10%", textAlign: "center" }}>POS Status</th>
              <th style={{ width: "15%", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading add-ons...
                </td>
              </tr>
            ) : addons.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No add-ons found.
                </td>
              </tr>
            ) : (
              addons.map((item) => {
                let categoryNames = "None";
                if (item.addon_categories && item.addon_categories.length > 0) {
                  const namesArray = item.addon_categories.map((ac) =>
                    ac.menu_categories ? ac.menu_categories.category_name : "",
                  );
                  categoryNames = namesArray.join(", ");
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <span className="menu-item-name">{item.addon_name}</span>
                    </td>
                    <td>
                      <strong>{formatCurrency(item.selling_price)}</strong>
                    </td>
                    <td>{categoryNames || "None"}</td>
                    <td>
                      <span
                        className={`menu-chip ${item.pos_status === "Available" ? "menu-chip--available" : "menu-chip--unavailable"}`}
                      >
                        {item.pos_status}
                      </span>
                    </td>
                    <td>
                      <div className="menu-actions">
                        <button
                          className="menu-action-btn menu-action-btn--edit"
                          title="Edit Add-on"
                          onClick={() => handleEditClick(item)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="menu-action-btn menu-action-btn--archive"
                          title={
                            item.archived === true
                              ? "Already Archived"
                              : "Delete Add-on"
                          }
                          onClick={() => handleDeleteClick(item)}
                          disabled={item.archived === true}
                          style={{
                            opacity: item.archived ? 0.4 : 1,
                            cursor:
                              item.archived === true
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAddonsTable;
