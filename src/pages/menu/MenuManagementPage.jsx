import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMenuManagement } from '../../hooks/useMenuManagement';

import MenuHeader from './components/MenuHeader';
import MenuTable from './components/MenuTable';

import ManageMenuCategoriesModal from './modals/Menu Categories/ManageMenuCategoriesModal';
import AddMenuItemModal from './modals/Add Menu Item/AddMenuItemModal';
import EditMenuItemModal from './modals/Edit Menu Item/EditMenuItemModal';
import ConfirmDeleteMenuItemModal from './modals/Confirm Delete Menu Item/ConfirmDeleteMenuItemModal';

import './menuManagement.css';

const MenuManagementPage = () => {
  const { menuItems, categories, isLoading, refetch: refetchMenu } = useMenuManagement();

  // Only Modal Variables exist here now!
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isDeleteMenuItemModalOpen, setIsDeleteMenuItemModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const navigate = useNavigate();

  const handleEditClick = (item) => {
    setSelectedMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedMenuItem(item);
    setIsDeleteMenuItemModalOpen(true);
  };

  return (
    <div className="menu-page">
      <MenuHeader
        setIsCategoriesModalOpen={setIsCategoriesModalOpen}
        setIsAddMenuItemModalOpen={setIsAddMenuItemModalOpen}
        navigate={navigate}
      />

      <MenuTable
        menuItems={menuItems}
        categories={categories}
        isLoading={isLoading}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
      />

      <ManageMenuCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        menuItems={menuItems}
        refetchMenu={refetchMenu}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
        refetchMenu={refetchMenu}
      />

      <EditMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onClose={() => {
          setIsEditMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
        refetchMenu={refetchMenu}
      />

      <ConfirmDeleteMenuItemModal
        isOpen={isDeleteMenuItemModalOpen}
        onClose={() => {
          setIsDeleteMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
        refetchMenu={refetchMenu}
      />

    </div>
  );
};

export default MenuManagementPage;
