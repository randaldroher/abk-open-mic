import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function PageBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1 }}>
      {items.map(({ label, href }, index) =>
        href ? (
          <MuiLink
            key={`${label}-${index}`}
            href={href}
            color="inherit"
            underline="hover"
          >
            {label}
          </MuiLink>
        ) : (
          <Typography
            key={`${label}-${index}`}
            color="textSecondary"
            aria-current="page"
          >
            {label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
