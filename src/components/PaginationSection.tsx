import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  import { PaginationMeta } from "@/types/pagination";
  
  interface PaginationSectionProps {
    onChangePage: (page: number) => void;
    meta: PaginationMeta;
  }
  
  const PaginationSection = (props: PaginationSectionProps) => {
  
    const handlePrev = () => {
      if (props.meta.page > 1) {
        props.onChangePage(props.meta.page - 1);
      }
    };
  
    const handleNext = () => {
      const totalPage = Math.ceil(props.meta.total / props.meta.take);
  
      if (props.meta.page < totalPage) {
        props.onChangePage(props.meta.page + 1);
      }
    };
  
    return (
      <Pagination className="mt-2">
        <PaginationContent>
          <PaginationItem onClick={handlePrev}>
            <PaginationPrevious />
          </PaginationItem>
  
          <PaginationItem>
            <PaginationLink>{props.meta.page}</PaginationLink>
          </PaginationItem>
  
          <PaginationItem onClick={handleNext}>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  export default PaginationSection;