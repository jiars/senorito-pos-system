import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

import { APP_ROUTE_METADATA } from "../../routes/routeMetadata";

const Breadcrumbs = () => {
  const location = useLocation();

  const currentRoute = APP_ROUTE_METADATA.find((item) => {
    return item.path === location.pathname;
  });

  if (currentRoute === undefined || currentRoute.path === "/pos") {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="text-sm text-[var(--app-color-text-subtle)]">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link to="/dashboard" />}
            className="text-[var(--app-color-text-subtle)] no-underline hover:text-[var(--app-color-brand)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
          >
            Señorito Café
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-[var(--app-color-text-subtle)]">
          <i className="bi bi-chevron-right text-sm leading-none"></i>
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <BreadcrumbPage className="font-bold text-[var(--app-color-text)]">
            {currentRoute.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
